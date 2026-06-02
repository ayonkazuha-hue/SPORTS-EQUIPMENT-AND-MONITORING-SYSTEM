/**
 * LocalStorage Database Wrapper
 * Handles auto-calculations and data persistence.
 */

const DB_KEY_EQUIPMENT = 'sports_equipment_db';
const DB_KEY_BORROWS = 'sports_borrows_db';

class Database {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        if (!localStorage.getItem(DB_KEY_EQUIPMENT)) {
            // Seed with initial mock data for WOW factor
            const mockEquipment = [
                {
                    equipmentId: 'EQ-0001',
                    equipmentName: 'Spalding Basketball',
                    category: 'Balls',
                    totalQuantity: 25,
                    unitPrice: 45.99,
                    purchaseDate: '2025-06-15',
                    conditionStatus: 'Good',
                    location: 'Storage A',
                    notes: 'Official Size 7',
                    createdDate: new Date().toISOString()
                },
                {
                    equipmentId: 'EQ-0002',
                    equipmentName: 'Wilson Tennis Racket',
                    category: 'Rackets',
                    totalQuantity: 12,
                    unitPrice: 89.99,
                    purchaseDate: '2025-08-10',
                    conditionStatus: 'Fair',
                    location: 'Storage B',
                    notes: '',
                    createdDate: new Date().toISOString()
                },
                {
                    equipmentId: 'EQ-0003',
                    equipmentName: 'Badminton Net Pro',
                    category: 'Nets & Poles',
                    totalQuantity: 5,
                    unitPrice: 120.00,
                    purchaseDate: '2025-01-20',
                    conditionStatus: 'Good',
                    location: 'Gym Center',
                    notes: 'Professional Grade',
                    createdDate: new Date().toISOString()
                },
                {
                    equipmentId: 'EQ-0004',
                    equipmentName: 'Yoga Mat (Thick)',
                    category: 'Mats',
                    totalQuantity: 30,
                    unitPrice: 25.00,
                    purchaseDate: '2026-02-01',
                    conditionStatus: 'Good',
                    location: 'Studio 1',
                    notes: 'Non-slip surface',
                    createdDate: new Date().toISOString()
                }
            ];
            localStorage.setItem(DB_KEY_EQUIPMENT, JSON.stringify(mockEquipment));
        }

        if (!localStorage.getItem(DB_KEY_BORROWS)) {
            const mockBorrows = [
                {
                    borrowId: 'BR-1001',
                    equipmentId: 'EQ-0001',
                    borrowedBy: 'John Smith',
                    quantity: 8,
                    borrowDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
                    returnDate: null,
                    status: 'ACTIVE'
                },
                {
                    borrowId: 'BR-1002',
                    equipmentId: 'EQ-0002',
                    borrowedBy: 'Sarah Connor',
                    quantity: 10,
                    borrowDate: new Date(Date.now() - 86400000 * 2).toISOString(),
                    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
                    returnDate: null,
                    status: 'ACTIVE'
                },
                {
                    borrowId: 'BR-1003',
                    equipmentId: 'EQ-0003',
                    borrowedBy: 'Mike Tyson',
                    quantity: 5,
                    borrowDate: new Date(Date.now() - 86400000 * 5).toISOString(),
                    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // Overdue
                    returnDate: null,
                    status: 'ACTIVE'
                }
            ];
            localStorage.setItem(DB_KEY_BORROWS, JSON.stringify(mockBorrows));
        }
    }

    // --- Core Data Fetching with Calculations --- //

    getEquipmentList() {
        const equipments = JSON.parse(localStorage.getItem(DB_KEY_EQUIPMENT) || '[]');
        const borrows = this.getBorrowRecords();

        return equipments.map(eq => {
            // Auto-Calculation Rules
            const eqBorrows = borrows.filter(b => b.equipmentId === eq.equipmentId && b.returnDate === null);
            const quantityBorrowed = eqBorrows.reduce((sum, b) => sum + parseInt(b.quantity), 0);
            const quantityAvailable = Math.max(0, parseInt(eq.totalQuantity) - quantityBorrowed);

            // Status Indicator
            let stockStatus = 'in-stock';
            let stockStatusText = '🟢 In Stock';
            if (quantityAvailable === 0) {
                stockStatus = 'out-of-stock';
                stockStatusText = '🔴 Out of Stock';
            } else if (quantityAvailable < (eq.totalQuantity * 0.2)) {
                stockStatus = 'low-stock';
                stockStatusText = '🟡 Low Stock';
            }

            return {
                ...eq,
                quantityBorrowed,
                quantityAvailable,
                stockStatus,
                stockStatusText
            };
        });
    }

    getEquipmentById(id) {
        return this.getEquipmentList().find(eq => eq.equipmentId === id) || null;
    }

    getBorrowRecords() {
        return JSON.parse(localStorage.getItem(DB_KEY_BORROWS) || '[]');
    }

    // --- CRUD Operations --- //

    saveEquipment(data) {
        const equipments = JSON.parse(localStorage.getItem(DB_KEY_EQUIPMENT) || '[]');
        const index = equipments.findIndex(e => e.equipmentId === data.equipmentId);
        
        if (index > -1) {
            // Update
            equipments[index] = { ...equipments[index], ...data, updatedDate: new Date().toISOString() };
        } else {
            // Create
            equipments.push({
                ...data,
                createdDate: new Date().toISOString()
            });
        }
        
        localStorage.setItem(DB_KEY_EQUIPMENT, JSON.stringify(equipments));
    }

    deleteEquipment(id) {
        const equipments = JSON.parse(localStorage.getItem(DB_KEY_EQUIPMENT) || '[]');
        const filtered = equipments.filter(e => e.equipmentId !== id);
        localStorage.setItem(DB_KEY_EQUIPMENT, JSON.stringify(filtered));
        
        // Optionally handle related borrow records (cascade delete or mark invalid)
    }

    generateNextEquipmentId() {
        const equipments = JSON.parse(localStorage.getItem(DB_KEY_EQUIPMENT) || '[]');
        const ids = equipments
            .map(e => e.equipmentId)
            .filter(id => /^EQ-\d+$/.test(id))
            .map(id => parseInt(id.split('-')[1], 10));

        const nextNumber = ids.length === 0 ? 1 : Math.max(...ids) + 1;
        const padded = String(nextNumber).padStart(3, '0');
        return `EQ-${padded}`;
    }

    borrowEquipment(borrowData) {
        const borrows = this.getBorrowRecords();
        const newBorrow = {
            ...borrowData,
            borrowId: 'BR-' + Math.floor(Math.random() * 10000),
            borrowDate: new Date().toISOString(),
            returnDate: null,
            status: 'ACTIVE'
        };
        borrows.push(newBorrow);
        localStorage.setItem(DB_KEY_BORROWS, JSON.stringify(borrows));
        return newBorrow;
    }

    returnEquipment(borrowId, returnData) {
        const borrows = this.getBorrowRecords();
        const index = borrows.findIndex(b => b.borrowId === borrowId);
        if (index > -1) {
            borrows[index].returnDate = new Date().toISOString();
            borrows[index].returnCondition = returnData.condition;
            borrows[index].returnNotes = returnData.notes;
            borrows[index].status = 'RETURNED';
            localStorage.setItem(DB_KEY_BORROWS, JSON.stringify(borrows));
            return true;
        }
        return false;
    }

    // --- Metrics for Dashboard --- //

    getDashboardMetrics() {
        const list = this.getEquipmentList();
        const activeBorrows = this.getBorrowRecords().filter(b => b.returnDate === null);
        
        const totalItems = list.reduce((sum, item) => sum + parseInt(item.totalQuantity), 0);
        const inStockCount = list.filter(item => item.quantityAvailable > 0).length;
        const outOfStockCount = list.filter(item => item.quantityAvailable === 0).length;
        const totalBorrowed = activeBorrows.reduce((sum, item) => sum + parseInt(item.quantity), 0);

        // Generate Alerts
        const alerts = [];
        list.forEach(item => {
            if (item.quantityAvailable === 0) {
                alerts.push({ type: 'danger', message: `🔴 ${item.equipmentName} - Out of Stock` });
            } else if (item.quantityAvailable < (item.totalQuantity * 0.2)) {
                alerts.push({ type: 'warning', message: `🟡 ${item.equipmentName} - Low Stock (${item.quantityAvailable} of ${item.totalQuantity})` });
            }
        });

        const now = new Date();
        activeBorrows.forEach(b => {
            const due = new Date(b.dueDate);
            if (due < now) {
                const eq = list.find(e => e.equipmentId === b.equipmentId);
                alerts.push({ type: 'warning', message: `🔔 Overdue Return: ${eq ? eq.equipmentName : b.equipmentId} by ${b.borrowedBy}` });
            }
        });

        return {
            totalItems,
            inStockCount,
            outOfStockCount,
            totalBorrowed,
            alerts
        };
    }
}

// Global instance
window.db = new Database();
