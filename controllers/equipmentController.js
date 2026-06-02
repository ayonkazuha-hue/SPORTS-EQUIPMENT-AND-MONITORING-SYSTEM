// controllers/equipmentController.js
// Equipment management business logic

const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const {
    calculateQuantityAvailable,
    getStockStatus,
    getStatusIndicator,
    getUsagePercentage,
    validateBorrowQuantity
} = require('../utils/calculations');
const { validateEquipmentData, validateBorrowData } = require('../utils/validators');

// =====================================================
// EQUIPMENT OPERATIONS
// =====================================================

/**
 * Get all equipment with auto-calculated fields
 */
async function getAllEquipment(req, res) {
    try {
        const connection = await pool.getConnection();
        
        const query = `
            SELECT 
                e.equipment_id,
                e.equipment_name,
                e.category_id,
                c.category_name,
                e.total_quantity,
                COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0) AS quantity_borrowed,
                (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) AS quantity_available,
                e.unit_price,
                e.purchase_date,
                e.condition_status,
                e.location,
                e.notes,
                e.is_active,
                e.created_date,
                e.updated_date
            FROM equipment e
            LEFT JOIN categories c ON e.category_id = c.category_id
            LEFT JOIN borrow_records br ON e.equipment_id = br.equipment_id
            WHERE e.is_active = TRUE
            GROUP BY e.equipment_id, e.equipment_name, e.category_id, c.category_name, 
                     e.total_quantity, e.unit_price, e.purchase_date, e.condition_status, 
                     e.location, e.notes, e.is_active, e.created_date, e.updated_date
            ORDER BY e.created_date DESC
        `;

        const [results] = await connection.query(query);
        connection.release();

        // Add calculated fields
        const equipment = results.map(item => ({
            ...item,
            stock_status: getStockStatus(item.quantity_available, item.total_quantity),
            status_indicator: getStatusIndicator(getStockStatus(item.quantity_available, item.total_quantity)),
            usage_percentage: getUsagePercentage(item.quantity_borrowed, item.total_quantity)
        }));

        res.json({
            success: true,
            data: equipment,
            count: equipment.length
        });
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch equipment',
            message: error.message
        });
    }
}

/**
 * Get single equipment with auto-calculated fields
 */
async function getEquipmentById(req, res) {
    try {
        const { equipmentId } = req.params;
        const connection = await pool.getConnection();

        const query = `
            SELECT 
                e.equipment_id,
                e.equipment_name,
                e.category_id,
                c.category_name,
                e.total_quantity,
                COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0) AS quantity_borrowed,
                (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) AS quantity_available,
                e.unit_price,
                e.purchase_date,
                e.condition_status,
                e.location,
                e.notes,
                e.is_active,
                e.created_date,
                e.updated_date
            FROM equipment e
            LEFT JOIN categories c ON e.category_id = c.category_id
            LEFT JOIN borrow_records br ON e.equipment_id = br.equipment_id AND br.return_date IS NULL
            WHERE e.equipment_id = ? AND e.is_active = TRUE
            GROUP BY e.equipment_id
        `;

        const [results] = await connection.query(query, [equipmentId]);
        connection.release();

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Equipment not found'
            });
        }

        const equipment = results[0];
        equipment.stock_status = getStockStatus(equipment.quantity_available, equipment.total_quantity);
        equipment.status_indicator = getStatusIndicator(equipment.stock_status);
        equipment.usage_percentage = getUsagePercentage(equipment.quantity_borrowed, equipment.total_quantity);

        res.json({
            success: true,
            data: equipment
        });
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch equipment',
            message: error.message
        });
    }
}

/**
 * Create new equipment
 */
async function createEquipment(req, res) {
    try {
        const equipmentData = {
            equipment_id: req.body.equipment_id,
            equipment_name: req.body.equipment_name,
            category_id: req.body.category_id,
            total_quantity: req.body.total_quantity,
            unit_price: req.body.unit_price || null,
            purchase_date: req.body.purchase_date || null,
            condition_status: req.body.condition_status || 'Good',
            location: req.body.location || null,
            notes: req.body.notes || null
        };

        // Validate equipment data
        const validation = validateEquipmentData(equipmentData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: validation.errors
            });
        }

        const connection = await pool.getConnection();

        // Check if equipment ID already exists
        const [existing] = await connection.query(
            'SELECT equipment_id FROM equipment WHERE equipment_id = ?',
            [equipmentData.equipment_id]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(409).json({
                success: false,
                error: 'Equipment ID already exists'
            });
        }

        // Insert equipment
        const query = `
            INSERT INTO equipment 
            (equipment_id, equipment_name, category_id, total_quantity, unit_price, 
             purchase_date, condition_status, location, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            equipmentData.equipment_id,
            equipmentData.equipment_name,
            equipmentData.category_id,
            equipmentData.total_quantity,
            equipmentData.unit_price,
            equipmentData.purchase_date,
            equipmentData.condition_status,
            equipmentData.location,
            equipmentData.notes
        ];

        await connection.query(query, values);

        // Fetch and return created equipment with calculated fields
        const [createdEquipment] = await connection.query(
            'SELECT * FROM equipment WHERE equipment_id = ?',
            [equipmentData.equipment_id]
        );

        connection.release();

        const result = createdEquipment[0];
        result.quantity_borrowed = 0;
        result.quantity_available = result.total_quantity;
        result.stock_status = getStockStatus(result.quantity_available, result.total_quantity);
        result.status_indicator = getStatusIndicator(result.stock_status);

        res.status(201).json({
            success: true,
            message: 'Equipment created successfully',
            data: result
        });
    } catch (error) {
        console.error('Error creating equipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create equipment',
            message: error.message
        });
    }
}

/**
 * Update equipment
 */
async function updateEquipment(req, res) {
    try {
        const { equipmentId } = req.params;
        const connection = await pool.getConnection();

        // Check if equipment exists
        const [existing] = await connection.query(
            'SELECT * FROM equipment WHERE equipment_id = ?',
            [equipmentId]
        );

        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                error: 'Equipment not found'
            });
        }

        // Build update query
        const updates = [];
        const values = [];

        if (req.body.equipment_name !== undefined) {
            updates.push('equipment_name = ?');
            values.push(req.body.equipment_name);
        }
        if (req.body.category_id !== undefined) {
            updates.push('category_id = ?');
            values.push(req.body.category_id);
        }
        if (req.body.total_quantity !== undefined) {
            updates.push('total_quantity = ?');
            values.push(req.body.total_quantity);
        }
        if (req.body.unit_price !== undefined) {
            updates.push('unit_price = ?');
            values.push(req.body.unit_price);
        }
        if (req.body.condition_status !== undefined) {
            updates.push('condition_status = ?');
            values.push(req.body.condition_status);
        }
        if (req.body.location !== undefined) {
            updates.push('location = ?');
            values.push(req.body.location);
        }
        if (req.body.notes !== undefined) {
            updates.push('notes = ?');
            values.push(req.body.notes);
        }

        if (updates.length === 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        values.push(equipmentId);
        const query = `UPDATE equipment SET ${updates.join(', ')} WHERE equipment_id = ?`;

        await connection.query(query, values);

        // Fetch and return updated equipment
        const [updated] = await connection.query(
            `SELECT 
                e.*,
                COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0) AS quantity_borrowed
            FROM equipment e
            LEFT JOIN borrow_records br ON e.equipment_id = br.equipment_id
            WHERE e.equipment_id = ?
            GROUP BY e.equipment_id`,
            [equipmentId]
        );

        connection.release();

        const result = updated[0];
        result.quantity_available = calculateQuantityAvailable(result.total_quantity, result.quantity_borrowed);
        result.stock_status = getStockStatus(result.quantity_available, result.total_quantity);
        result.status_indicator = getStatusIndicator(result.stock_status);

        res.json({
            success: true,
            message: 'Equipment updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update equipment',
            message: error.message
        });
    }
}

/**
 * Delete (soft delete) equipment
 */
async function deleteEquipment(req, res) {
    try {
        const { equipmentId } = req.params;
        const connection = await pool.getConnection();

        const [existing] = await connection.query(
            'SELECT * FROM equipment WHERE equipment_id = ?',
            [equipmentId]
        );

        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                error: 'Equipment not found'
            });
        }

        // Soft delete
        await connection.query(
            'UPDATE equipment SET is_active = FALSE WHERE equipment_id = ?',
            [equipmentId]
        );

        connection.release();

        res.json({
            success: true,
            message: 'Equipment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete equipment',
            message: error.message
        });
    }
}

// =====================================================
// BORROW OPERATIONS
// =====================================================

/**
 * Create borrow record (AUTO-UPDATES quantity borrowed and available)
 */
async function borrowEquipment(req, res) {
    try {
        const borrowData = {
            equipment_id: req.body.equipment_id,
            borrowed_by: req.body.borrowed_by,
            quantity: req.body.quantity,
            due_date: req.body.due_date
        };

        // Validate borrow data
        const validation = validateBorrowData(borrowData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: validation.errors
            });
        }

        const connection = await pool.getConnection();

        // Get equipment and check availability
        const [equipment] = await connection.query(
            `SELECT 
                e.total_quantity,
                COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0) AS quantity_borrowed
            FROM equipment e
            LEFT JOIN borrow_records br ON e.equipment_id = br.equipment_id
            WHERE e.equipment_id = ?
            GROUP BY e.equipment_id`,
            [borrowData.equipment_id]
        );

        if (equipment.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                error: 'Equipment not found'
            });
        }

        const quantityAvailable = calculateQuantityAvailable(
            equipment[0].total_quantity,
            equipment[0].quantity_borrowed
        );

        // Validate borrow quantity
        const borrowValidation = validateBorrowQuantity(borrowData.quantity, quantityAvailable);
        if (!borrowValidation.valid) {
            connection.release();
            return res.status(400).json({
                success: false,
                error: borrowValidation.message
            });
        }

        // Create borrow record
        const borrowId = `BR-${uuidv4().substring(0, 8).toUpperCase()}`;
        const query = `
            INSERT INTO borrow_records 
            (borrow_id, equipment_id, borrowed_by, quantity, due_date)
            VALUES (?, ?, ?, ?, ?)
        `;

        await connection.query(query, [
            borrowId,
            borrowData.equipment_id,
            borrowData.borrowed_by,
            borrowData.quantity,
            borrowData.due_date
        ]);

        // Fetch updated equipment (quantities auto-recalculated)
        const [updated] = await connection.query(
            `SELECT 
                e.*,
                COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0) AS quantity_borrowed
            FROM equipment e
            LEFT JOIN borrow_records br ON e.equipment_id = br.equipment_id
            WHERE e.equipment_id = ?
            GROUP BY e.equipment_id`,
            [borrowData.equipment_id]
        );

        connection.release();

        const equipment_result = updated[0];
        equipment_result.quantity_available = calculateQuantityAvailable(
            equipment_result.total_quantity,
            equipment_result.quantity_borrowed
        );
        equipment_result.stock_status = getStockStatus(
            equipment_result.quantity_available,
            equipment_result.total_quantity
        );

        res.status(201).json({
            success: true,
            message: 'Equipment borrowed successfully. Quantities auto-updated.',
            data: {
                borrow_id: borrowId,
                equipment: equipment_result,
                borrow_info: {
                    quantity_borrowed: borrowData.quantity,
                    due_date: borrowData.due_date
                }
            }
        });
    } catch (error) {
        console.error('Error creating borrow record:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create borrow record',
            message: error.message
        });
    }
}

/**
 * Return equipment (AUTO-UPDATES quantity borrowed and available)
 */
async function returnEquipment(req, res) {
    try {
        const { borrowId } = req.params;
        const connection = await pool.getConnection();

        // Get borrow record
        const [borrow] = await connection.query(
            'SELECT * FROM borrow_records WHERE borrow_id = ?',
            [borrowId]
        );

        if (borrow.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                error: 'Borrow record not found'
            });
        }

        if (borrow[0].return_date !== null) {
            connection.release();
            return res.status(400).json({
                success: false,
                error: 'Equipment has already been returned'
            });
        }

        // Update return information
        const query = `
            UPDATE borrow_records 
            SET return_date = NOW(), 
                condition_at_return = ?,
                notes = ?
            WHERE borrow_id = ?
        `;

        await connection.query(query, [
            req.body.condition_at_return || 'Good',
            req.body.notes || null,
            borrowId
        ]);

        // Fetch updated equipment (quantities auto-recalculated)
        const [updated] = await connection.query(
            `SELECT 
                e.*,
                COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0) AS quantity_borrowed
            FROM equipment e
            LEFT JOIN borrow_records br ON e.equipment_id = br.equipment_id
            WHERE e.equipment_id = ?
            GROUP BY e.equipment_id`,
            [borrow[0].equipment_id]
        );

        connection.release();

        const equipment_result = updated[0];
        equipment_result.quantity_available = calculateQuantityAvailable(
            equipment_result.total_quantity,
            equipment_result.quantity_borrowed
        );
        equipment_result.stock_status = getStockStatus(
            equipment_result.quantity_available,
            equipment_result.total_quantity
        );

        res.json({
            success: true,
            message: 'Equipment returned successfully. Quantities auto-updated.',
            data: {
                borrow_id: borrowId,
                returned_quantity: borrow[0].quantity,
                equipment: equipment_result
            }
        });
    } catch (error) {
        console.error('Error returning equipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to return equipment',
            message: error.message
        });
    }
}

/**
 * Get active borrow records
 */
async function getActiveBorrows(req, res) {
    try {
        const connection = await pool.getConnection();

        const query = `
            SELECT 
                br.*,
                e.equipment_name,
                e.total_quantity,
                u.full_name,
                DATEDIFF(br.due_date, CURDATE()) AS days_remaining,
                CASE WHEN CURDATE() > br.due_date THEN TRUE ELSE FALSE END AS is_overdue
            FROM borrow_records br
            LEFT JOIN equipment e ON br.equipment_id = e.equipment_id
            LEFT JOIN users u ON br.borrowed_by = u.user_id
            WHERE br.return_date IS NULL
            ORDER BY br.due_date ASC
        `;

        const [results] = await connection.query(query);
        connection.release();

        res.json({
            success: true,
            data: results,
            count: results.length
        });
    } catch (error) {
        console.error('Error fetching active borrows:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch active borrows',
            message: error.message
        });
    }
}

/**
 * Get borrow history for equipment
 */
async function getBorrowHistory(req, res) {
    try {
        const { equipmentId } = req.params;
        const connection = await pool.getConnection();

        const query = `
            SELECT 
                br.*,
                u.full_name,
                u.username,
                e.equipment_name
            FROM borrow_records br
            LEFT JOIN users u ON br.borrowed_by = u.user_id
            LEFT JOIN equipment e ON br.equipment_id = e.equipment_id
            WHERE br.equipment_id = ?
            ORDER BY br.borrow_date DESC
        `;

        const [results] = await connection.query(query, [equipmentId]);
        connection.release();

        res.json({
            success: true,
            data: results,
            count: results.length
        });
    } catch (error) {
        console.error('Error fetching borrow history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch borrow history',
            message: error.message
        });
    }
}

module.exports = {
    getAllEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    borrowEquipment,
    returnEquipment,
    getActiveBorrows,
    getBorrowHistory
};
