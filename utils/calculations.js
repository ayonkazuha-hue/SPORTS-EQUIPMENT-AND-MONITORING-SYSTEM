// utils/calculations.js
// Auto-calculation logic for equipment quantities and status

/**
 * Calculate quantity borrowed for an equipment
 * @param {number} quantity - The borrowed quantity
 * @returns {number} - Quantity borrowed (validated)
 */
function calculateQuantityBorrowed(quantity) {
    return Math.max(0, parseInt(quantity) || 0);
}

/**
 * Calculate quantity available
 * @param {number} totalQuantity - Total equipment units
 * @param {number} quantityBorrowed - Currently borrowed units
 * @returns {number} - Available quantity (never negative)
 */
function calculateQuantityAvailable(totalQuantity, quantityBorrowed) {
    const total = parseInt(totalQuantity) || 0;
    const borrowed = parseInt(quantityBorrowed) || 0;
    return Math.max(0, total - borrowed);
}

/**
 * Determine stock status based on availability
 * @param {number} quantityAvailable - Available quantity
 * @param {number} totalQuantity - Total quantity
 * @returns {string} - Stock status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
 */
function getStockStatus(quantityAvailable, totalQuantity) {
    const available = parseInt(quantityAvailable) || 0;
    const total = parseInt(totalQuantity) || 0;

    if (available === 0) {
        return 'OUT_OF_STOCK';
    }

    // Low stock if available is less than 20% of total
    if (total > 0 && available < (total * 0.2)) {
        return 'LOW_STOCK';
    }

    return 'IN_STOCK';
}

/**
 * Get stock status indicator
 * @param {string} status - Stock status
 * @returns {object} - Status with icon and color
 */
function getStatusIndicator(status) {
    const indicators = {
        'IN_STOCK': { icon: '🟢', color: 'green', label: 'In Stock' },
        'LOW_STOCK': { icon: '🟡', color: 'yellow', label: 'Low Stock' },
        'OUT_OF_STOCK': { icon: '🔴', color: 'red', label: 'Out of Stock' }
    };
    return indicators[status] || indicators['IN_STOCK'];
}

/**
 * Check if borrow quantity is valid
 * @param {number} quantityToBorrow - Quantity to borrow
 * @param {number} quantityAvailable - Available quantity
 * @returns {object} - { valid: boolean, message: string }
 */
function validateBorrowQuantity(quantityToBorrow, quantityAvailable) {
    const toBorrow = parseInt(quantityToBorrow) || 0;
    const available = parseInt(quantityAvailable) || 0;

    if (toBorrow <= 0) {
        return { valid: false, message: 'Borrow quantity must be greater than 0' };
    }

    if (toBorrow > available) {
        return { 
            valid: false, 
            message: `Cannot borrow ${toBorrow}. Only ${available} available.` 
        };
    }

    return { valid: true, message: 'Borrow quantity is valid' };
}

/**
 * Calculate percentage of stock used
 * @param {number} quantityBorrowed - Borrowed quantity
 * @param {number} totalQuantity - Total quantity
 * @returns {number} - Percentage (0-100)
 */
function getUsagePercentage(quantityBorrowed, totalQuantity) {
    const borrowed = parseInt(quantityBorrowed) || 0;
    const total = parseInt(totalQuantity) || 0;

    if (total === 0) return 0;
    return Math.round((borrowed / total) * 100);
}

/**
 * Check if borrow is overdue
 * @param {Date|string} dueDate - Due date
 * @returns {boolean} - True if overdue
 */
function isOverdue(dueDate) {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    return due < new Date();
}

module.exports = {
    calculateQuantityBorrowed,
    calculateQuantityAvailable,
    getStockStatus,
    getStatusIndicator,
    validateBorrowQuantity,
    getUsagePercentage,
    isOverdue
};
