/**
 * Database Layer — Official Supabase JS Client (browser)
 * Uses @supabase/supabase-js loaded from CDN in index.html.
 * Works on Vercel, GitHub Pages, any static host — no backend needed.
 */

const SUPABASE_URL      = 'https://vtmgcfsuevxfogycdoni.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bWdjZnN1ZXZ4Zm9neWNkb25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNzU4NDEsImV4cCI6MjA5NTk1MTg0MX0.MWXdfeBsRR_4JJRQ_fP4YMIaVg19s9jxZdN_2lHGozk';

// Lazy-init: createClient is called on first use, after all scripts have loaded
let _supa = null;
function getSupa() {
    if (!_supa) {
        if (!window.supabase) throw new Error('Supabase CDN not loaded. Check your internet connection.');
        _supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supa;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function stockStatus(available, total) {
    if (available <= 0)          return 'out-of-stock';
    if (available < total * 0.2) return 'low-stock';
    return 'in-stock';
}

function stockStatusText(available, total) {
    if (available <= 0)          return '🔴 Out of Stock';
    if (available < total * 0.2) return '🟡 Low Stock';
    return '🟢 In Stock';
}

function enrich(eq, borrowedMap = {}) {
    const borrowed  = Number(borrowedMap[eq.equipment_id] ?? eq.quantity_borrowed ?? 0);
    const total     = Number(eq.total_quantity);
    const available = Math.max(0, total - borrowed);
    return {
        ...eq,
        equipmentId:       eq.equipment_id,
        equipmentName:     eq.equipment_name,
        totalQuantity:     total,
        quantityBorrowed:  borrowed,
        quantityAvailable: available,
        conditionStatus:   eq.condition_status,
        createdDate:       eq.created_at,
        stockStatus:       stockStatus(available, total),
        stockStatusText:   stockStatusText(available, total),
    };
}

function parseBorrow(b) {
    let extra = {};
    try { extra = JSON.parse(b.notes || '{}'); } catch (e) {
        extra = { purpose: b.notes };
    }
    return {
        borrowId:          b.borrow_id,
        equipmentId:       b.equipment_id,
        equipmentName:     b.equipment?.equipment_name ?? null,
        borrowedBy:        extra.borrowedBy    ?? b.borrowed_by ?? null,
        quantity:          Number(b.quantity),
        borrowDate:        b.borrow_date,
        dueDate:           b.due_date,
        returnDate:        b.return_date,
        status:            b.return_date ? 'RETURNED' : 'ACTIVE',
        category:          extra.category      ?? null,
        categoryOther:     extra.categoryOther ?? null,
        idNo:              extra.idNo          ?? null,
        contactNumber:     extra.contactNumber ?? null,
        useFrom:           extra.useFrom       ?? null,
        issuedBy:          extra.issuedBy      ?? null,
        purpose:           extra.purpose       ?? null,
        conditionAtReturn: extra.conditionAtReturn ?? null,
        returnNotes:       extra.returnNotes   ?? null,
    };
}

// ── Database class ────────────────────────────────────────────────────────────

class Database {

    // ── Equipment ─────────────────────────────────────────────────────────────

    async getEquipmentList() {
        const { data: equipment, error: eErr } = await getSupa()
            .from('equipment')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        if (eErr) throw new Error(eErr.message);

        const { data: borrows, error: bErr } = await getSupa()
            .from('borrow_records')
            .select('equipment_id, quantity')
            .is('return_date', null);
        if (bErr) throw new Error(bErr.message);

        const borrowedMap = {};
        (borrows || []).forEach(b => {
            borrowedMap[b.equipment_id] = (borrowedMap[b.equipment_id] || 0) + Number(b.quantity);
        });

        return (equipment || []).map(eq => enrich(eq, borrowedMap));
    }

    async getEquipmentById(id) {
        const { data, error } = await getSupa()
            .from('equipment')
            .select('*')
            .eq('equipment_id', id)
            .eq('is_active', true)
            .single();
        if (error) throw new Error(error.message);

        const { data: borrows } = await getSupa()
            .from('borrow_records')
            .select('quantity')
            .eq('equipment_id', id)
            .is('return_date', null);

        const borrowed = (borrows || []).reduce((s, b) => s + Number(b.quantity), 0);
        return enrich({ ...data, quantity_borrowed: borrowed });
    }

    async saveEquipment(data) {
        // Auto-generate ID for new equipment
        let equipment_id = data.equipmentId || null;
        if (!equipment_id) {
            const { data: existing } = await getSupa()
                .from('equipment')
                .select('equipment_id')
                .order('created_at', { ascending: false })
                .limit(1);
            const last = existing && existing[0]
                ? parseInt(existing[0].equipment_id.replace('EQ-', ''), 10) : 0;
            equipment_id = `EQ-${String(last + 1).padStart(4, '0')}`;
        }

        const row = {
            equipment_id,
            equipment_name:   data.equipmentName,
            category_id:      data.category_id || 'CAT-008',
            total_quantity:   Number(data.totalQuantity),
            condition_status: data.conditionStatus || 'Good',
            notes:            data.notes || null,
            is_active:        true,
        };

        // Check if record exists to decide insert vs update
        const { data: existing } = await getSupa()
            .from('equipment')
            .select('equipment_id')
            .eq('equipment_id', equipment_id);

        if (existing && existing.length > 0) {
            const { error } = await getSupa()
                .from('equipment')
                .update({
                    equipment_name:   row.equipment_name,
                    total_quantity:   row.total_quantity,
                    condition_status: row.condition_status,
                    notes:            row.notes,
                })
                .eq('equipment_id', equipment_id);
            if (error) throw new Error(error.message);
        } else {
            const { error } = await getSupa().from('equipment').insert(row);
            if (error) throw new Error(error.message);
        }

        return this.getEquipmentById(equipment_id);
    }

    async deleteEquipment(id) {
        const { error } = await getSupa()
            .from('equipment')
            .update({ is_active: false })
            .eq('equipment_id', id);
        if (error) throw new Error(error.message);
    }

    async generateNextEquipmentId() {
        return ''; // server assigns IDs
    }

    // ── Borrow Records ────────────────────────────────────────────────────────

    async getBorrowRecords() {
        const { data, error } = await getSupa()
            .from('borrow_records')
            .select('*, equipment(equipment_name)')
            .order('borrow_date', { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []).map(parseBorrow);
    }

    async borrowEquipment(b) {
        // Verify availability
        const eq = await this.getEquipmentById(b.equipmentId);
        if (Number(b.quantity) > eq.quantityAvailable) {
            throw new Error(`Only ${eq.quantityAvailable} unit(s) available`);
        }

        const borrow_id = `BR-${Date.now().toString(36).toUpperCase()}`;
        const { data, error } = await getSupa().from('borrow_records').insert({
            borrow_id,
            equipment_id: b.equipmentId,
            borrowed_by:  b.borrowedBy || 'Guest',
            quantity:     Number(b.quantity),
            borrow_date:  new Date().toISOString(),
            due_date:     b.dueDate,
            return_date:  null,
            notes: JSON.stringify({
                borrowedBy:    b.borrowedBy    || null,
                category:      b.category      || null,
                categoryOther: b.categoryOther || null,
                idNo:          b.idNo          || null,
                contactNumber: b.contactNumber || null,
                useFrom:       b.useFrom       || null,
                issuedBy:      b.issuedBy      || null,
                purpose:       b.purpose       || null,
            }),
        }).select().single();

        if (error) throw new Error(error.message);
        return parseBorrow(data);
    }

    async returnEquipment(borrowId, returnData) {
        // Fetch existing notes to merge condition into
        const { data: existing, error: fetchErr } = await getSupa()
            .from('borrow_records')
            .select('notes')
            .eq('borrow_id', borrowId)
            .single();
        if (fetchErr) throw new Error(fetchErr.message);

        let notesObj = {};
        try { notesObj = JSON.parse(existing.notes || '{}'); } catch (e) {}
        notesObj.conditionAtReturn = returnData.condition || 'Good';
        notesObj.returnNotes       = returnData.notes     || null;

        const { error } = await getSupa()
            .from('borrow_records')
            .update({
                return_date: new Date().toISOString(),
                notes:       JSON.stringify(notesObj),
            })
            .eq('borrow_id', borrowId);

        if (error) throw new Error(error.message);
        return true;
    }

    // ── Dashboard Metrics ─────────────────────────────────────────────────────

    async getDashboardMetrics() {
        const [equipmentList, borrowRecords] = await Promise.all([
            this.getEquipmentList(),
            this.getBorrowRecords(),
        ]);

        const activeBorrows   = borrowRecords.filter(b => !b.returnDate);
        const inStockCount    = equipmentList.filter(e => e.quantityAvailable > 0).length;
        const outOfStockCount = equipmentList.filter(e => e.quantityAvailable === 0).length;
        const totalBorrowed   = activeBorrows.reduce((s, b) => s + Number(b.quantity), 0);

        const alerts = [];
        const now    = new Date();

        equipmentList.forEach(e => {
            if (e.quantityAvailable === 0) {
                alerts.push({ type: 'danger',  message: `🔴 ${e.equipmentName} - Out of Stock` });
            } else if (e.quantityAvailable < e.totalQuantity * 0.2) {
                alerts.push({ type: 'warning', message: `🟡 ${e.equipmentName} - Low Stock (${e.quantityAvailable} of ${e.totalQuantity})` });
            }
        });

        activeBorrows.forEach(b => {
            if (b.dueDate && new Date(b.dueDate) < now) {
                const eq = equipmentList.find(e => e.equipmentId === b.equipmentId);
                alerts.push({ type: 'warning', message: `🔔 Overdue: ${eq ? eq.equipmentName : b.equipmentId} borrowed by ${b.borrowedBy}` });
            }
        });

        return { equipmentList, borrowRecords, activeBorrows, inStockCount, outOfStockCount, totalBorrowed, alerts };
    }
}

window.db = new Database();

