-- SPORTS EQUIPMENT AND MONITORING SYSTEM
-- MySQL Database Setup Script
-- Execute this script to create all required tables

-- =====================================================
-- CREATE DATABASE
-- =====================================================
CREATE DATABASE IF NOT EXISTS sports_equipment_system;
USE sports_equipment_system;

-- =====================================================
-- CREATE CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    category_id VARCHAR(50) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CREATE EQUIPMENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id VARCHAR(50) PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    total_quantity INT NOT NULL CHECK (total_quantity >= 0),
    unit_price DECIMAL(10, 2),
    purchase_date DATE,
    condition_status VARCHAR(50) DEFAULT 'Good',
    location VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_equipment_name (equipment_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CREATE USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'User',
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CREATE BORROW RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS borrow_records (
    borrow_id VARCHAR(50) PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    borrowed_by VARCHAR(50) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL,
    return_date TIMESTAMP NULL,
    condition_at_return VARCHAR(50),
    notes TEXT,
    is_overdue BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    FOREIGN KEY (borrowed_by) REFERENCES users(user_id),
    INDEX idx_equipment (equipment_id),
    INDEX idx_borrowed_by (borrowed_by),
    INDEX idx_return_date (return_date),
    INDEX idx_active_borrow (equipment_id, return_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CREATE AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    equipment_id VARCHAR(50),
    user_id VARCHAR(50),
    old_value JSON,
    new_value JSON,
    description TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_equipment (equipment_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_date (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT SAMPLE CATEGORIES
-- =====================================================
INSERT INTO categories (category_id, category_name, description) VALUES
('CAT-001', 'Balls', 'Basketball, Soccer Ball, Tennis Ball, Volleyball, etc.'),
('CAT-002', 'Rackets & Paddles', 'Tennis Racket, Badminton Racket, Ping Pong Paddle, etc.'),
('CAT-003', 'Protective Gear', 'Helmet, Knee Pads, Elbow Pads, Gloves, etc.'),
('CAT-004', 'Nets & Poles', 'Badminton Net, Volleyball Net, Goal Post, etc.'),
('CAT-005', 'Mats & Floors', 'Yoga Mat, Gym Mat, Exercise Mat, etc.'),
('CAT-006', 'Weights & Resistance', 'Dumbbells, Kettlebells, Resistance Bands, etc.'),
('CAT-007', 'Accessories', 'Cones, Markers, Bags, Whistles, etc.')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- =====================================================
-- INSERT SAMPLE USERS
-- =====================================================
INSERT INTO users (user_id, username, email, full_name, role) VALUES
('USR-001', 'john_smith', 'john@example.com', 'John Smith', 'Admin'),
('USR-002', 'jane_doe', 'jane@example.com', 'Jane Doe', 'Manager'),
('USR-003', 'mike_lee', 'mike@example.com', 'Mike Lee', 'User'),
('USR-004', 'sarah_wilson', 'sarah@example.com', 'Sarah Wilson', 'User')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- =====================================================
-- INSERT SAMPLE EQUIPMENT
-- =====================================================
INSERT INTO equipment (equipment_id, equipment_name, category_id, total_quantity, unit_price, purchase_date, location) VALUES
('EQ-0001', 'Spalding Basketball', 'CAT-001', 25, 45.99, '2025-06-15', 'Storage Room A - Shelf 2'),
('EQ-0002', 'Tennis Ball (Pack)', 'CAT-001', 50, 12.99, '2025-05-20', 'Storage Room B - Shelf 1'),
('EQ-0003', 'Tennis Racket (Adult)', 'CAT-002', 12, 89.99, '2025-07-01', 'Storage Room A - Shelf 4'),
('EQ-0004', 'Badminton Net', 'CAT-004', 5, 34.50, '2025-08-10', 'Outdoor Storage'),
('EQ-0005', 'Yoga Mat (Purple)', 'CAT-005', 30, 25.00, '2025-09-15', 'Gym Storage'),
('EQ-0006', 'Dumbbells (5kg)', 'CAT-006', 50, 15.00, '2025-04-01', 'Weight Room - Rack 1'),
('EQ-0007', 'Safety Helmet (M)', 'CAT-003', 15, 45.00, '2025-10-01', 'Safety Equipment Room')
ON DUPLICATE KEY UPDATE equipment_name = VALUES(equipment_name);

-- =====================================================
-- INSERT SAMPLE BORROW RECORDS
-- =====================================================
INSERT INTO borrow_records (borrow_id, equipment_id, borrowed_by, quantity, borrow_date, due_date, return_date) VALUES
('BR-0001', 'EQ-0001', 'USR-003', 3, '2026-06-01 10:00:00', '2026-06-08', NULL),
('BR-0002', 'EQ-0001', 'USR-004', 2, '2026-05-31 14:30:00', '2026-06-07', NULL),
('BR-0003', 'EQ-0001', 'USR-002', 3, '2026-05-29 09:15:00', '2026-06-05', NULL),
('BR-0004', 'EQ-0005', 'USR-003', 5, '2026-05-25 16:45:00', '2026-06-01', '2026-06-02 10:00:00'),
('BR-0005', 'EQ-0002', 'USR-004', 10, '2026-05-15 11:20:00', '2026-06-15', NULL)
ON DUPLICATE KEY UPDATE borrowed_by = VALUES(borrowed_by);

-- =====================================================
-- CREATE VIEWS FOR AUTO-CALCULATED FIELDS
-- =====================================================

-- View to get quantity borrowed for each equipment
CREATE OR REPLACE VIEW equipment_borrow_summary AS
SELECT 
    e.equipment_id,
    e.equipment_name,
    e.total_quantity,
    COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0) AS quantity_borrowed,
    (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) AS quantity_available,
    CASE 
        WHEN (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) = 0 THEN 'OUT_OF_STOCK'
        WHEN (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) > 0 
             AND (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) < (e.total_quantity * 0.2)
        THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_status
FROM equipment e
LEFT JOIN borrow_records br ON e.equipment_id = br.equipment_id
WHERE e.is_active = TRUE
GROUP BY e.equipment_id, e.equipment_name, e.total_quantity;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_borrow_equipment_return ON borrow_records(equipment_id, return_date);
CREATE INDEX idx_borrow_due_date ON borrow_records(due_date);
CREATE INDEX idx_borrow_status ON borrow_records(return_date);

-- =====================================================
-- VERIFY TABLE CREATION
-- =====================================================
SELECT 'Database setup complete! Tables created:' AS status;
SHOW TABLES;
