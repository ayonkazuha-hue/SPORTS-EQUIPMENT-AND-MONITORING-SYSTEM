/**
 * Database Layer — Direct Supabase browser client
 * Works on Vercel (static hosting) and any device with no backend server needed.
 * All data is read/written directly to Supabase from the browser.
 */

// ── Supabase credentials (public anon key — safe to expose in browser) ─────────
const SUPABASE_URL     = 'https://vtmgcfsuevxfogycdoni.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bWdjZnN1ZXZ4Zm9neWNkb25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNzU4NDEsImV4cCI6MjA5NTk1MTg0MX0.MWXdfeBsRR_4JJRQ_fP4YMIaVg19s9jxZdN_2lHGozk';

// ── Lightweight Supabase REST helper (no npm needed) ───────────────────────────
class SupabaseClient {
    constructor(url, key) {
        this.url  = url;
        this.key  = key;
        this.base = `${url}/rest/v1`;
    }

    _headers(extra = {}) {
        return {
            'apikey':        this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type':  'application/json',
            'Prefer':        'return=representation',
            ...extra,
        };
    }

    async _req(method, path, body, params = {}) {
        const qs = Object.keys(params).length
            ? '?' + new URLSearchParams(params).toString()
            : '';
        const res = await fetch(`${this.base}${path}${qs}`, {
            method,
            headers: this._headers(),
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || err.details || `Supabase error ${res.status}`);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : [];
    }

    // SELECT
    from(table) { return new QueryBuilder(this, table); }

    // INSERT
    async insert(table, rows) {
        const data = Array.isArray(rows) ? rows : [rows];
        return this._req('POST', `/${table}`, data);
    }

    // UPDATE  — filter: { col: val }
    async update(table, updates, filter) {
        const qs = Object.entries(filter).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
        return this._req('PATCH', `/${table}?${qs}`, updates);
    }

    // UPSERT
    async upsert(table, rows) {
        const data = Array.isArray(rows) ? rows : [rows];
        const res = await fetch(`${this.base}/${table}`, {
            method: 'POST',
            headers: this._headers({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
            body: JSON.stringify(data),
        });
        const text = await res.text();
        return text ? JSON.parse(text) : [];
    }
}

class QueryBuilder {
    constructor(client, table) {
        this._c     = client;
        this._table = table;
        this._params = {};
        this._method = 'GET';
        this._body   = null;
    }
    select(cols = '*') { this._params.select = cols; return this; }
    eq(col, val)        { this._params[col] = `eq.${val}`; return this; }
    is(col, val)        { this._params[col] = val === null ? 'is.null' : `is.${val}`; return this; }
    order(col, { ascending = true } = {}) { this._params.order = `${col}.${ascending ? 'asc' : 'desc'}`; return this; }
    limit(n)            { this._params.limit = n; return this; }
    like(col, val)      { this._params[col] = `like.${val}`; return this; }

    async _run() {
        // Convert eq/is params → PostgREST format
        const url  = `${this._c.base}/${this._table}`;
        const parts = [];
        for (const [k, v] of Object.entries(this._params)) {
            if (k === 'select' || k === 'order' || k === 'limit') continue;
            parts.push(`${k}=${encodeURIComponent(v)}`);
        }
        if (this._params.select) parts.push(`select=${encodeURIComponent(this._params.select)}`);
        if (this._params.order)  parts.push(`order=${encodeURIComponent(this._params.order)}`);
        if (this._params.limit)  parts.push(`limit=${this._params.limit}`);

        const qs  = parts.length ? '?' + parts.join('&') : '';
        const res = await fetch(`${url}${qs}`, {
            method:  this._method,
            headers: this._c._headers(),
            body:    this._body ? JSON.stringify(this._body) : undefined,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || err.details || `Supabase error ${res.status} on ${this._table}`);
        }
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        return { data, error: null };
    }

    then(resolve, reject) { return this._run().then(resolve, reject); }
}

const supa = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Helpers ─────────────────────────────────────────────────────────────────
function stockStatus(available, total) {
    if (available <= 0)              return 'out-of-stock';
    if (available < total * 0.2)     return 'low-stock';
    return 'in-stock';
}
function stockStatusText(available, total) {
    if (available <= 0)              return '🔴 Out of Stock';
    if (available < total * 0.2)     return '🟡 Low Stock';
    return '🟢 In Stock';
}
function enrich(eq, borrowedMap = {}) {
    const borrowed  = Number(borrowedMap[eq.equipment_id] || eq.quantity_borrowed || 0);
    const available = Math.max(0, Number(eq.total_quantity) - borrowed);
    return {
        ...eq,
        equipmentId:      eq.equipment_id,
        equipmentName:    eq.equipment_name,
        totalQuantity:    Number(eq.total_quantity),
        quantityBorrowed: borrowed,
        quantityAvailable: available,
        conditionStatus:  eq.condition_status,
        stockStatus:      stockStatus(available, eq.total_quantity),
        stockStatusText:  stockStatusText(available, eq.total_quantity),
    };
}
function parseBorrow(b) {
    let extra = {};
    try { extra = JSON.parse(b.notes || '{}'); } catch(e) { extra = { purpose: b.notes }; }
    return {
        borrowId:         b.borrow_id,
        equipmentId:      b.equipment_id,
        equipmentName:    (b.equipment && b.equipment.equipment_name) || null,
        borrowedBy:       extra.borrowedBy    || b.borrowed_by || null,
        quantity:         Number(b.quantity),
        borrowDate:       b.borrow_date,
        dueDate:          b.due_date,
        returnDate:       b.return_date,
        status:           b.return_date ? 'RETURNED' : 'ACTIVE',
        category:         extra.category      || null,
        categoryOther:    extra.categoryOther || null,
        idNo:             extra.idNo          || null,
        contactNumber:    extra.contactNumber || null,
        useFrom:          extra.useFrom       || null,
        issuedBy:         extra.issuedBy      || null,
        purpose:          extra.purpose       || null,
        conditionAtReturn: extra.conditionAtReturn || null,
        returnNotes:      extra.returnNotes   || null,
    };
}

// ── Database class ───────────────────────────────────────────────────────────
class Database {

    // ── Equipment ─────────────────────────────────────────────────────────────
    async getEquipmentList() {
        const { data: equipment } = await supa.from('equipment')
            .select('*').eq('is_active', 'true').order('created_at', { ascending: false });

        const { data: borrows } = await supa.from('borrow_records')
            .select('equipment_id,quantity').is('return_date', null);

        const borrowedMap = {};
        (borrows || []).forEach(b => {
            borrowedMap[b.equipment_id] = (borrowedMap[b.equipment_id] || 0) + Number(b.quantity);
        });

        return (equipment || []).map(eq => enrich(eq, borrowedMap));
    }

    async getEquipmentById(id) {
        const { data } = await supa.from('equipment')
            .select('*').eq('equipment_id', id).eq('is_active', 'true');
        if (!data || data.length === 0) throw new Error('Equipment not found');

        const { data: borrows } = await supa.from('borrow_records')
            .select('quantity').eq('equipment_id', id).is('return_date', null);
        const borrowed = (borrows || []).reduce((s, b) => s + Number(b.quantity), 0);
        return enrich(data[0], { [id]: borrowed });
    }

    async saveEquipment(data) {
        // Auto-generate ID if new
        let equipment_id = data.equipmentId;
        if (!equipment_id) {
            const { data: existing } = await supa.from('equipment')
                .select('equipment_id').order('equipment_id', { ascending: false }).limit(1);
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

        // Try update first, then insert
        const { data: existing } = await supa.from('equipment')
            .select('equipment_id').eq('equipment_id', equipment_id);
        if (existing && existing.length > 0) {
            await supa.update('equipment', {
                equipment_name:   row.equipment_name,
                total_quantity:   row.total_quantity,
                condition_status: row.condition_status,
                notes:            row.notes,
            }, { equipment_id });
        } else {
            await supa.insert('equipment', row);
        }
        return this.getEquipmentById(equipment_id);
    }

    async deleteEquipment(id) {
        await supa.update('equipment', { is_active: false }, { equipment_id: id });
    }

    async generateNextEquipmentId() { return ''; }

    // ── Borrow Records ────────────────────────────────────────────────────────
    async getBorrowRecords() {
        const { data } = await supa.from('borrow_records')
            .select('*').order('borrow_date', { ascending: false });
        return (data || []).map(parseBorrow);
    }

    async borrowEquipment(b) {
        // Check availability
        const eq = await this.getEquipmentById(b.equipmentId);
        if (Number(b.quantity) > eq.quantityAvailable) {
            throw new Error(`Only ${eq.quantityAvailable} unit(s) available`);
        }

        const borrow_id = `BR-${Date.now().toString(36).toUpperCase()}`;
        const row = {
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
        };
        const inserted = await supa.insert('borrow_records', row);
        return parseBorrow(inserted[0]);
    }

    async returnEquipment(borrowId, returnData) {
        // Get existing notes to merge condition in
        const { data: existing } = await supa.from('borrow_records')
            .select('notes').eq('borrow_id', borrowId);
        let notesObj = {};
        try { notesObj = JSON.parse((existing && existing[0] && existing[0].notes) || '{}'); } catch(e) {}
        notesObj.conditionAtReturn = returnData.condition || 'Good';
        notesObj.returnNotes       = returnData.notes     || null;

        await supa.update('borrow_records', {
            return_date: new Date().toISOString(),
            notes:       JSON.stringify(notesObj),
        }, { borrow_id: borrowId });
        return true;
    }

    // ── Dashboard Metrics ────────────────────────────────────────────────────
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
        const now = new Date();

        equipmentList.forEach(e => {
            if (e.quantityAvailable === 0)
                alerts.push({ type: 'danger',  message: `🔴 ${e.equipmentName} - Out of Stock` });
            else if (e.quantityAvailable < e.totalQuantity * 0.2)
                alerts.push({ type: 'warning', message: `🟡 ${e.equipmentName} - Low Stock (${e.quantityAvailable} of ${e.totalQuantity})` });
        });

        activeBorrows.forEach(b => {
            if (b.dueDate && new Date(b.dueDate) < now) {
                const eq = equipmentList.find(e => e.equipmentId === b.equipmentId);
                alerts.push({ type: 'warning', message: `🔔 Overdue: ${eq ? eq.equipmentName : b.equipmentId} borrowed by ${b.borrowedBy}` });
            }
        });

        return { equipmentList, inStockCount, outOfStockCount, totalBorrowed, alerts };
    }
}

window.db = new Database();
