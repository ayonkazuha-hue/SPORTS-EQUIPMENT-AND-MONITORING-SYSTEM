-- SPORTS EQUIPMENT AND MONITORING SYSTEM
-- PostgreSQL / Supabase Migration (converted from MySQL)
-- Run this in Supabase SQL Editor

-- =====================================================
-- NOTE: Do NOT run CREATE DATABASE or USE in Supabase.
-- The Supabase project provides the database. This script
-- creates tables, indexes, views, triggers and sample data.
-- =====================================================

-- Enable extension for UUIDs if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function to auto-update `updated_date`
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    category_id VARCHAR(50) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_categories_updated_date
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_date();

-- =====================================================
-- CREATE EQUIPMENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id VARCHAR(50) PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    total_quantity INT NOT NULL CHECK (total_quantity >= 0),
    unit_price NUMERIC(10,2),
    purchase_date DATE,
    condition_status VARCHAR(50) DEFAULT 'Good',
    location VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipment_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE INDEX IF NOT EXISTS idx_category ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_active ON equipment(is_active);
CREATE INDEX IF NOT EXISTS idx_equipment_name ON equipment(equipment_name);

CREATE TRIGGER trg_equipment_updated_date
BEFORE UPDATE ON equipment
FOR EACH ROW
EXECUTE FUNCTION update_updated_date();

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
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);

CREATE TRIGGER trg_users_updated_date
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_date();

-- =====================================================
-- CREATE BORROW RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS borrow_records (
    borrow_id VARCHAR(50) PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    borrowed_by VARCHAR(50) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    borrow_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE NULL,
    condition_at_return VARCHAR(50),
    notes TEXT,
    is_overdue BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_borrow_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    CONSTRAINT fk_borrow_user FOREIGN KEY (borrowed_by) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_equipment ON borrow_records(equipment_id);
CREATE INDEX IF NOT EXISTS idx_borrowed_by ON borrow_records(borrowed_by);
CREATE INDEX IF NOT EXISTS idx_return_date ON borrow_records(return_date);
CREATE INDEX IF NOT EXISTS idx_active_borrow ON borrow_records(equipment_id, return_date);

CREATE TRIGGER trg_borrow_records_updated_date
BEFORE UPDATE ON borrow_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_date();

-- =====================================================
-- CREATE AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    log_id SERIAL PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    equipment_id VARCHAR(50),
    user_id VARCHAR(50),
    old_value JSONB,
    new_value JSONB,
    description TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_audit_equipment ON audit_log(equipment_id);
CREATE INDEX IF NOT EXISTS idx_action_type ON audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_created_date ON audit_log(created_date);

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
ON CONFLICT (category_id) DO UPDATE SET description = EXCLUDED.description;

-- =====================================================
-- INSERT SAMPLE USERS
-- =====================================================
INSERT INTO users (user_id, username, email, full_name, role) VALUES
('USR-001', 'john_smith', 'john@example.com', 'John Smith', 'Admin'),
('USR-002', 'jane_doe', 'jane@example.com', 'Jane Doe', 'Manager'),
('USR-003', 'mike_lee', 'mike@example.com', 'Mike Lee', 'User'),
('USR-004', 'sarah_wilson', 'sarah@example.com', 'Sarah Wilson', 'User')
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

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
ON CONFLICT (equipment_id) DO UPDATE SET equipment_name = EXCLUDED.equipment_name;

-- =====================================================
-- INSERT SAMPLE BORROW RECORDS
-- =====================================================
INSERT INTO borrow_records (borrow_id, equipment_id, borrowed_by, quantity, borrow_date, due_date, return_date) VALUES
('BR-0001', 'EQ-0001', 'USR-003', 3, '2026-06-01 10:00:00', '2026-06-08', NULL),
('BR-0002', 'EQ-0001', 'USR-004', 2, '2026-05-31 14:30:00', '2026-06-07', NULL),
('BR-0003', 'EQ-0001', 'USR-002', 3, '2026-05-29 09:15:00', '2026-06-05', NULL),
('BR-0004', 'EQ-0005', 'USR-003', 5, '2026-05-25 16:45:00', '2026-06-01', '2026-06-02 10:00:00'),
('BR-0005', 'EQ-0002', 'USR-004', 10, '2026-05-15 11:20:00', '2026-06-15', NULL)
ON CONFLICT (borrow_id) DO UPDATE SET borrowed_by = EXCLUDED.borrowed_by;

-- =====================================================
-- CREATE VIEW FOR AUTO-CALCULATED FIELDS
-- =====================================================
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
CREATE INDEX IF NOT EXISTS idx_borrow_equipment_return ON borrow_records(equipment_id, return_date);
CREATE INDEX IF NOT EXISTS idx_borrow_due_date ON borrow_records(due_date);
CREATE INDEX IF NOT EXISTS idx_borrow_status ON borrow_records(return_date);

-- =====================================================
-- FINISHED
-- =====================================================
SELECT 'Database setup complete! Tables created and data inserted.' AS status;
