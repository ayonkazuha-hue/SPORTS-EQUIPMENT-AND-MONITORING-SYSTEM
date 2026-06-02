// utils/validators.js
// Input validation utilities

/**
 * Validate equipment ID format
 * @param {string} equipmentId - Equipment ID to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateEquipmentId(equipmentId) {
    if (!equipmentId || typeof equipmentId !== 'string') {
        return { valid: false, error: 'Equipment ID is required and must be a string' };
    }

    if (equipmentId.trim().length === 0) {
        return { valid: false, error: 'Equipment ID cannot be empty' };
    }

    if (!/^[A-Z0-9-]+$/.test(equipmentId)) {
        return { valid: false, error: 'Equipment ID must contain only letters, numbers, and hyphens' };
    }

    if (equipmentId.length > 50) {
        return { valid: false, error: 'Equipment ID must be 50 characters or less' };
    }

    return { valid: true };
}

/**
 * Validate equipment name
 * @param {string} name - Equipment name to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateEquipmentName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'Equipment name is required and must be a string' };
    }

    if (name.trim().length === 0) {
        return { valid: false, error: 'Equipment name cannot be empty' };
    }

    if (name.length > 255) {
        return { valid: false, error: 'Equipment name must be 255 characters or less' };
    }

    return { valid: true };
}

/**
 * Validate total quantity
 * @param {number} quantity - Quantity to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateTotalQuantity(quantity) {
    const qty = parseInt(quantity);

    if (isNaN(qty)) {
        return { valid: false, error: 'Total quantity must be a number' };
    }

    if (qty < 0) {
        return { valid: false, error: 'Total quantity cannot be negative' };
    }

    if (!Number.isInteger(qty)) {
        return { valid: false, error: 'Total quantity must be a whole number' };
    }

    if (qty > 999999) {
        return { valid: false, error: 'Total quantity cannot exceed 999,999' };
    }

    return { valid: true };
}

/**
 * Validate category ID
 * @param {string} categoryId - Category ID to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateCategoryId(categoryId) {
    if (!categoryId || typeof categoryId !== 'string') {
        return { valid: false, error: 'Category ID is required and must be a string' };
    }

    if (categoryId.trim().length === 0) {
        return { valid: false, error: 'Category ID cannot be empty' };
    }

    return { valid: true };
}

/**
 * Validate unit price
 * @param {number} price - Price to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateUnitPrice(price) {
    if (price === null || price === undefined || price === '') {
        return { valid: true }; // Price is optional
    }

    const p = parseFloat(price);

    if (isNaN(p)) {
        return { valid: false, error: 'Unit price must be a number' };
    }

    if (p < 0) {
        return { valid: false, error: 'Unit price cannot be negative' };
    }

    if (p > 999999.99) {
        return { valid: false, error: 'Unit price is too high' };
    }

    return { valid: true };
}

/**
 * Validate purchase date
 * @param {string} date - Date to validate (YYYY-MM-DD format)
 * @returns {object} - { valid: boolean, error?: string }
 */
function validatePurchaseDate(date) {
    if (!date || date === '') {
        return { valid: true }; // Date is optional
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
        return { valid: false, error: 'Purchase date must be a valid date' };
    }

    if (dateObj > new Date()) {
        return { valid: false, error: 'Purchase date cannot be in the future' };
    }

    return { valid: true };
}

/**
 * Validate borrow quantity
 * @param {number} quantity - Quantity to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateBorrowQuantity(quantity) {
    const qty = parseInt(quantity);

    if (isNaN(qty)) {
        return { valid: false, error: 'Borrow quantity must be a number' };
    }

    if (qty <= 0) {
        return { valid: false, error: 'Borrow quantity must be greater than 0' };
    }

    if (!Number.isInteger(qty)) {
        return { valid: false, error: 'Borrow quantity must be a whole number' };
    }

    return { valid: true };
}

/**
 * Validate due date for borrow
 * @param {string} dueDate - Due date to validate (YYYY-MM-DD format)
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateDueDate(dueDate) {
    if (!dueDate) {
        return { valid: false, error: 'Due date is required' };
    }

    const dateObj = new Date(dueDate);

    if (isNaN(dateObj.getTime())) {
        return { valid: false, error: 'Due date must be a valid date' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateObj < today) {
        return { valid: false, error: 'Due date cannot be in the past' };
    }

    return { valid: true };
}

/**
 * Validate user ID
 * @param {string} userId - User ID to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
        return { valid: false, error: 'User ID is required and must be a string' };
    }

    if (userId.trim().length === 0) {
        return { valid: false, error: 'User ID cannot be empty' };
    }

    return { valid: true };
}

/**
 * Validate all equipment fields
 * @param {object} equipmentData - Equipment data to validate
 * @returns {object} - { valid: boolean, errors: object }
 */
function validateEquipmentData(equipmentData) {
    const errors = {};

    // Validate required fields
    const idValidation = validateEquipmentId(equipmentData.equipment_id);
    if (!idValidation.valid) errors.equipment_id = idValidation.error;

    const nameValidation = validateEquipmentName(equipmentData.equipment_name);
    if (!nameValidation.valid) errors.equipment_name = nameValidation.error;

    const categoryValidation = validateCategoryId(equipmentData.category_id);
    if (!categoryValidation.valid) errors.category_id = categoryValidation.error;

    const qtyValidation = validateTotalQuantity(equipmentData.total_quantity);
    if (!qtyValidation.valid) errors.total_quantity = qtyValidation.error;

    // Validate optional fields
    if (equipmentData.unit_price !== undefined && equipmentData.unit_price !== null) {
        const priceValidation = validateUnitPrice(equipmentData.unit_price);
        if (!priceValidation.valid) errors.unit_price = priceValidation.error;
    }

    if (equipmentData.purchase_date) {
        const dateValidation = validatePurchaseDate(equipmentData.purchase_date);
        if (!dateValidation.valid) errors.purchase_date = dateValidation.error;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validate borrow data
 * @param {object} borrowData - Borrow data to validate
 * @returns {object} - { valid: boolean, errors: object }
 */
function validateBorrowData(borrowData) {
    const errors = {};

    const equipmentValidation = validateEquipmentId(borrowData.equipment_id);
    if (!equipmentValidation.valid) errors.equipment_id = equipmentValidation.error;

    const userValidation = validateUserId(borrowData.borrowed_by);
    if (!userValidation.valid) errors.borrowed_by = userValidation.error;

    const qtyValidation = validateBorrowQuantity(borrowData.quantity);
    if (!qtyValidation.valid) errors.quantity = qtyValidation.error;

    const dateValidation = validateDueDate(borrowData.due_date);
    if (!dateValidation.valid) errors.due_date = dateValidation.error;

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

module.exports = {
    validateEquipmentId,
    validateEquipmentName,
    validateTotalQuantity,
    validateCategoryId,
    validateUnitPrice,
    validatePurchaseDate,
    validateBorrowQuantity,
    validateDueDate,
    validateUserId,
    validateEquipmentData,
    validateBorrowData
};
