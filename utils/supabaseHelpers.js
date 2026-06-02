// utils/supabaseHelpers.js
// Helper functions for Supabase operations

const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Get all equipment with auto-calculated quantities using Supabase
 */
async function getAllEquipmentSupabase() {
    try {
        const { data, error } = await supabase
            .from('equipment_summary')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching equipment:', error);
        throw error;
    }
}

/**
 * Get single equipment by ID with auto-calculated quantities
 */
async function getEquipmentByIdSupabase(equipmentId) {
    try {
        const { data, error } = await supabase
            .from('equipment_summary')
            .select('*')
            .eq('equipment_id', equipmentId)
            .eq('is_active', true)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching equipment:', error);
        throw error;
    }
}

/**
 * Create new equipment in Supabase
 */
async function createEquipmentSupabase(equipmentData) {
    try {
        const { data, error } = await supabaseAdmin
            .from('equipment')
            .insert([equipmentData])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error creating equipment:', error);
        throw error;
    }
}

/**
 * Update equipment in Supabase
 */
async function updateEquipmentSupabase(equipmentId, updates) {
    try {
        const { data, error } = await supabaseAdmin
            .from('equipment')
            .update(updates)
            .eq('equipment_id', equipmentId)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error updating equipment:', error);
        throw error;
    }
}

/**
 * Delete (soft delete) equipment in Supabase
 */
async function deleteEquipmentSupabase(equipmentId) {
    try {
        const { error } = await supabaseAdmin
            .from('equipment')
            .update({ is_active: false })
            .eq('equipment_id', equipmentId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting equipment:', error);
        throw error;
    }
}

/**
 * Create borrow record in Supabase
 */
async function createBorrowSupabase(borrowData) {
    try {
        const { data, error } = await supabaseAdmin
            .from('borrow_records')
            .insert([borrowData])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error creating borrow record:', error);
        throw error;
    }
}

/**
 * Update borrow record (return) in Supabase
 */
async function returnBorrowSupabase(borrowId, returnData) {
    try {
        const { data, error } = await supabaseAdmin
            .from('borrow_records')
            .update(returnData)
            .eq('borrow_id', borrowId)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error returning equipment:', error);
        throw error;
    }
}

/**
 * Get active borrow records from Supabase
 */
async function getActiveBorrowsSupabase() {
    try {
        const { data, error } = await supabase
            .from('borrow_records')
            .select(`
                *,
                equipment:equipment_id (equipment_name, total_quantity),
                user:borrowed_by (full_name, username)
            `)
            .is('return_date', null)
            .order('due_date', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching active borrows:', error);
        throw error;
    }
}

/**
 * Get borrow history for equipment from Supabase
 */
async function getBorrowHistorySupabase(equipmentId) {
    try {
        const { data, error } = await supabase
            .from('borrow_records')
            .select(`
                *,
                user:borrowed_by (full_name, username)
            `)
            .eq('equipment_id', equipmentId)
            .order('borrow_date', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching borrow history:', error);
        throw error;
    }
}

/**
 * Check equipment availability in Supabase
 */
async function checkAvailabilitySupabase(equipmentId) {
    try {
        const { data, error } = await supabase
            .from('equipment_summary')
            .select('total_quantity, quantity_borrowed, quantity_available')
            .eq('equipment_id', equipmentId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error checking availability:', error);
        throw error;
    }
}

/**
 * Add audit log entry in Supabase
 */
async function addAuditLogSupabase(auditData) {
    try {
        const { error } = await supabaseAdmin
            .from('audit_log')
            .insert([auditData]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error adding audit log:', error);
        throw error;
    }
}

/**
 * Get user by ID (Supabase Auth)
 */
async function getUserSupabase(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

/**
 * Create new user in users table
 */
async function createUserSupabase(userData) {
    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .insert([userData])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

module.exports = {
    getAllEquipmentSupabase,
    getEquipmentByIdSupabase,
    createEquipmentSupabase,
    updateEquipmentSupabase,
    deleteEquipmentSupabase,
    createBorrowSupabase,
    returnBorrowSupabase,
    getActiveBorrowsSupabase,
    getBorrowHistorySupabase,
    checkAvailabilitySupabase,
    addAuditLogSupabase,
    getUserSupabase,
    createUserSupabase
};
