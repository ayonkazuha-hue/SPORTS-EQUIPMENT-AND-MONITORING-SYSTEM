// routes/equipmentRoutes.js

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/equipmentController');

// ── Equipment ──────────────────────────────────────────────
router.get('/',                              ctrl.getAllEquipment);
router.post('/',                             ctrl.createEquipment);
router.get('/borrow/active',                 ctrl.getActiveBorrows);  // before /:id
router.get('/borrow/all',                    ctrl.getAllBorrowRecords);
router.post('/borrow',                       ctrl.borrowEquipment);
router.put('/borrow/:borrowId/return',       ctrl.returnEquipment);
router.get('/:equipmentId/borrow-history',   ctrl.getBorrowHistory);
router.get('/:equipmentId',                  ctrl.getEquipmentById);
router.put('/:equipmentId',                  ctrl.updateEquipment);
router.delete('/:equipmentId',               ctrl.deleteEquipment);

module.exports = router;
