// routes/equipmentRoutes.js
// Equipment API endpoints

const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');

// =====================================================
// EQUIPMENT ENDPOINTS
// =====================================================

// Get all equipment
// GET /api/equipment
router.get('/', equipmentController.getAllEquipment);

// Get single equipment
// GET /api/equipment/:equipmentId
router.get('/:equipmentId', equipmentController.getEquipmentById);

// Create new equipment
// POST /api/equipment
// Body: { equipment_id, equipment_name, category_id, total_quantity, ... }
router.post('/', equipmentController.createEquipment);

// Update equipment
// PUT /api/equipment/:equipmentId
// Body: { equipment_name, category_id, total_quantity, ... }
router.put('/:equipmentId', equipmentController.updateEquipment);

// Delete equipment (soft delete)
// DELETE /api/equipment/:equipmentId
router.delete('/:equipmentId', equipmentController.deleteEquipment);

// =====================================================
// BORROW ENDPOINTS
// =====================================================

// Borrow equipment
// POST /api/equipment/borrow
// Body: { equipment_id, borrowed_by, quantity, due_date }
router.post('/borrow', equipmentController.borrowEquipment);

// Return equipment
// PUT /api/equipment/borrow/:borrowId/return
// Body: { condition_at_return, notes }
router.put('/borrow/:borrowId/return', equipmentController.returnEquipment);

// Get active borrows
// GET /api/equipment/borrow/active
router.get('/borrow/active', equipmentController.getActiveBorrows);

// Get borrow history for equipment
// GET /api/equipment/:equipmentId/borrow-history
router.get('/:equipmentId/borrow-history', equipmentController.getBorrowHistory);

module.exports = router;
