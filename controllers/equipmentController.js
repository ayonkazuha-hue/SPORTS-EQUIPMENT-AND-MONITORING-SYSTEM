// controllers/equipmentController.js
// Equipment management — Supabase backend

const { supabaseAdmin: db } = require('../config/supabase');

// ── helpers ────────────────────────────────────────────────────────────────────

function stockStatus(available, total) {
    if (available <= 0) return 'out-of-stock';
    if (available < total * 0.2) return 'low-stock';
    return 'in-stock';
}

function stockStatusText(available, total) {
    if (available <= 0) return '🔴 Out of Stock';
    if (available < total * 0.2) return '🟡 Low Stock';
    return '🟢 In Stock';
}

function enrich(eq) {
    const borrowed = Number(eq.quantity_borrowed ?? 0);
    const available = Math.max(0, Number(eq.total_quantity) - borrowed);
    return {
        ...eq,
        quantity_borrowed: borrowed,
        quantity_available: available,
        stockStatus: stockStatus(available, eq.total_quantity),
        stockStatusText: stockStatusText(available, eq.total_quantity),
        // camelCase aliases for the frontend
        equipmentId: eq.equipment_id,
        equipmentName: eq.equipment_name,
        totalQuantity: Number(eq.total_quantity),
        quantityBorrowed: borrowed,
        quantityAvailable: available,
        conditionStatus: eq.condition_status,
        createdDate: eq.created_at,
        updatedDate: eq.updated_at,
    };
}

// ── GET /api/equipment ─────────────────────────────────────────────────────────
async function getAllEquipment(req, res) {
    try {
        // Fetch all active equipment
        const { data: equipment, error: eqErr } = await db
            .from('equipment')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (eqErr) throw eqErr;

        // Fetch active borrow quantities per equipment
        const { data: borrows, error: bErr } = await db
            .from('borrow_records')
            .select('equipment_id, quantity')
            .is('return_date', null);

        if (bErr) throw bErr;

        // Aggregate borrowed per equipment
        const borrowedMap = {};
        (borrows || []).forEach(b => {
            borrowedMap[b.equipment_id] = (borrowedMap[b.equipment_id] || 0) + Number(b.quantity);
        });

        const result = (equipment || []).map(eq => enrich({
            ...eq,
            quantity_borrowed: borrowedMap[eq.equipment_id] || 0,
        }));

        res.json({ success: true, data: result, count: result.length });
    } catch (err) {
        console.error('getAllEquipment error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

// ── GET /api/equipment/:id ─────────────────────────────────────────────────────
async function getEquipmentById(req, res) {
    try {
        const { equipmentId } = req.params;

        const { data: equipment, error } = await db
            .from('equipment')
            .select('*')
            .eq('equipment_id', equipmentId)
            .eq('is_active', true)
            .single();

        if (error || !equipment) return res.status(404).json({ success: false, error: 'Equipment not found' });

        const { data: borrows } = await db
            .from('borrow_records')
            .select('quantity')
            .eq('equipment_id', equipmentId)
            .is('return_date', null);

        const borrowed = (borrows || []).reduce((s, b) => s + Number(b.quantity), 0);
        res.json({ success: true, data: enrich({ ...equipment, quantity_borrowed: borrowed }) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ── POST /api/equipment ────────────────────────────────────────────────────────
async function createEquipment(req, res) {
    try {
        const b = req.body;
        if (!b.equipment_name || !b.total_quantity) {
            return res.status(400).json({ success: false, error: 'equipment_name and total_quantity are required' });
        }

        // Auto-generate ID if not supplied
        let equipment_id = b.equipment_id;
        if (!equipment_id) {
            const { data: existing } = await db
                .from('equipment')
                .select('equipment_id')
                .like('equipment_id', 'EQ-%')
                .order('equipment_id', { ascending: false })
                .limit(1);
            const last = existing && existing[0] ? parseInt(existing[0].equipment_id.replace('EQ-', ''), 10) : 0;
            equipment_id = `EQ-${String(last + 1).padStart(4, '0')}`;
        }

        const row = {
            equipment_id,
            equipment_name:   b.equipment_name,
            category_id:      b.category_id || 'CAT-008',
            total_quantity:   Number(b.total_quantity),
            condition_status: b.condition_status || b.conditionStatus || 'Good',
            notes:            b.notes || null,
            is_active:        true,
        };

        const { data, error } = await db.from('equipment').insert(row).select().single();
        if (error) throw error;

        res.status(201).json({ success: true, data: enrich({ ...data, quantity_borrowed: 0 }) });
    } catch (err) {
        console.error('createEquipment error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

// ── PUT /api/equipment/:id ─────────────────────────────────────────────────────
async function updateEquipment(req, res) {
    try {
        const { equipmentId } = req.params;
        const b = req.body;

        const updates = {};
        if (b.equipment_name  !== undefined) updates.equipment_name  = b.equipment_name;
        if (b.total_quantity  !== undefined) updates.total_quantity  = Number(b.total_quantity);
        if (b.condition_status !== undefined) updates.condition_status = b.condition_status;
        if (b.conditionStatus !== undefined)  updates.condition_status = b.conditionStatus;
        if (b.notes           !== undefined) updates.notes           = b.notes;

        const { data, error } = await db
            .from('equipment')
            .update(updates)
            .eq('equipment_id', equipmentId)
            .select()
            .single();

        if (error) throw error;

        const { data: borrows } = await db
            .from('borrow_records')
            .select('quantity')
            .eq('equipment_id', equipmentId)
            .is('return_date', null);

        const borrowed = (borrows || []).reduce((s, b) => s + Number(b.quantity), 0);
        res.json({ success: true, data: enrich({ ...data, quantity_borrowed: borrowed }) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ── DELETE /api/equipment/:id ──────────────────────────────────────────────────
async function deleteEquipment(req, res) {
    try {
        const { equipmentId } = req.params;
        const { error } = await db
            .from('equipment')
            .update({ is_active: false })
            .eq('equipment_id', equipmentId);

        if (error) throw error;
        res.json({ success: true, message: 'Equipment deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ── POST /api/equipment/borrow ─────────────────────────────────────────────────
async function borrowEquipment(req, res) {
    try {
        const b = req.body;

        // Check availability
        const { data: eq, error: eqErr } = await db
            .from('equipment')
            .select('total_quantity, equipment_name')
            .eq('equipment_id', b.equipment_id)
            .eq('is_active', true)
            .single();

        if (eqErr || !eq) return res.status(404).json({ success: false, error: 'Equipment not found' });

        const { data: activeBorrows } = await db
            .from('borrow_records')
            .select('quantity')
            .eq('equipment_id', b.equipment_id)
            .is('return_date', null);

        const borrowed = (activeBorrows || []).reduce((s, r) => s + Number(r.quantity), 0);
        const available = Number(eq.total_quantity) - borrowed;

        if (Number(b.quantity) > available) {
            return res.status(400).json({ success: false, error: `Only ${available} unit(s) available` });
        }

        // Generate borrow ID
        const borrow_id = `BR-${Date.now().toString(36).toUpperCase()}`;

        const row = {
            borrow_id,
            equipment_id:       b.equipment_id,
            borrowed_by:        b.borrowedBy || b.borrowed_by || 'Guest',
            quantity:           Number(b.quantity),
            borrow_date:        new Date().toISOString(),
            due_date:           b.dueDate || b.due_date,
            return_date:        null,
            notes: JSON.stringify({
                borrowedBy:    b.borrowedBy    || b.borrowed_by || null,
                category:      b.category      || null,
                categoryOther: b.categoryOther || null,
                idNo:          b.idNo          || null,
                contactNumber: b.contactNumber || null,
                useFrom:       b.useFrom       || null,
                issuedBy:      b.issuedBy      || null,
                purpose:       b.purpose       || null,
            }),
        };

        const { data, error } = await db.from('borrow_records').insert(row).select().single();
        if (error) throw error;

        res.status(201).json({ success: true, data: normalizeBorrow(data) });
    } catch (err) {
        console.error('borrowEquipment error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

// ── PUT /api/equipment/borrow/:borrowId/return ─────────────────────────────────
async function returnEquipment(req, res) {
    try {
        const { borrowId } = req.params;

        const { data: existing, error: findErr } = await db
            .from('borrow_records')
            .select('*')
            .eq('borrow_id', borrowId)
            .single();

        if (findErr || !existing) return res.status(404).json({ success: false, error: 'Borrow record not found' });
        if (existing.return_date) return res.status(400).json({ success: false, error: 'Already returned' });

        // Merge condition into notes JSON
        let notesObj = {};
        try { notesObj = JSON.parse(existing.notes || '{}'); } catch (e) { notesObj = {}; }
        notesObj.conditionAtReturn = req.body.condition || req.body.condition_at_return || 'Good';
        notesObj.returnNotes = req.body.notes || null;

        const { data, error } = await db
            .from('borrow_records')
            .update({ return_date: new Date().toISOString(), notes: JSON.stringify(notesObj) })
            .eq('borrow_id', borrowId)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data: normalizeBorrow(data) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ── GET /api/borrow-records ────────────────────────────────────────────────────
async function getAllBorrowRecords(req, res) {
    try {
        const { data, error } = await db
            .from('borrow_records')
            .select('*, equipment(equipment_name)')
            .order('borrow_date', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: (data || []).map(normalizeBorrow) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ── GET /api/equipment/borrow/active ──────────────────────────────────────────
async function getActiveBorrows(req, res) {
    try {
        const { data, error } = await db
            .from('borrow_records')
            .select('*, equipment(equipment_name, total_quantity)')
            .is('return_date', null)
            .order('due_date', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data: (data || []).map(normalizeBorrow), count: data.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ── GET /api/equipment/:id/borrow-history ──────────────────────────────────────
async function getBorrowHistory(req, res) {
    try {
        const { equipmentId } = req.params;
        const { data, error } = await db
            .from('borrow_records')
            .select('*, equipment(equipment_name)')
            .eq('equipment_id', equipmentId)
            .order('borrow_date', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: (data || []).map(normalizeBorrow) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// ── normalize borrow record (expand notes JSON back to flat fields) ─────────────
function normalizeBorrow(b) {
    let extra = {};
    try { extra = JSON.parse(b.notes || '{}'); } catch (e) { extra = { purpose: b.notes }; }
    return {
        borrowId:         b.borrow_id,
        borrow_id:        b.borrow_id,
        equipmentId:      b.equipment_id,
        equipment_id:     b.equipment_id,
        equipmentName:    b.equipment?.equipment_name || null,
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

module.exports = {
    getAllEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    borrowEquipment,
    returnEquipment,
    getAllBorrowRecords,
    getActiveBorrows,
    getBorrowHistory,
};
