-- Supabase SQL Migrations for Sports Equipment System
-- Execute these queries in Supabase SQL Editor

-- =====================================================
-- CREATE TABLES FOR SUPABASE (PostgreSQL)
-- =====================================================

-- 1. Categories Table
CREATE TABLE categories (
    category_id TEXT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Equipment Table
CREATE TABLE equipment (
    equipment_id TEXT PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    category_id TEXT NOT NULL REFERENCES categories(category_id),
    total_quantity INTEGER NOT NULL CHECK (total_quantity >= 0),
    unit_price DECIMAL(10, 2),
    purchase_date DATE,
    condition_status VARCHAR(50) DEFAULT 'Good',
    location VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Users Table
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'User',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Borrow Records Table
CREATE TABLE borrow_records (
    borrow_id TEXT PRIMARY KEY,
    equipment_id TEXT NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
    borrowed_by TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    borrow_date TIMESTAMP DEFAULT NOW(),
    due_date DATE NOT NULL,
    return_date TIMESTAMP,
    condition_at_return VARCHAR(50),
    notes TEXT,
    is_overdue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Audit Log Table
CREATE TABLE audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    equipment_id TEXT REFERENCES equipment(equipment_id) ON DELETE SET NULL,
    user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    old_value JSONB,
    new_value JSONB,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_active ON equipment(is_active);
CREATE INDEX idx_borrow_equipment ON borrow_records(equipment_id);
CREATE INDEX idx_borrow_user ON borrow_records(borrowed_by);
CREATE INDEX idx_borrow_return_date ON borrow_records(return_date);
CREATE INDEX idx_borrow_due_date ON borrow_records(due_date);
CREATE INDEX idx_borrow_active ON borrow_records(equipment_id, return_date);

-- =====================================================
-- CREATE VIEWS FOR AUTO-CALCULATIONS
-- =====================================================

-- View: Equipment with auto-calculated quantities
CREATE OR REPLACE VIEW equipment_summary AS
SELECT 
    e.equipment_id,
    e.equipment_name,
    e.category_id,
    c.category_name,
    e.total_quantity,
    COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0) AS quantity_borrowed,
    (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) AS quantity_available,
    CASE 
        WHEN (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) = 0 THEN 'OUT_OF_STOCK'
        WHEN (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) > 0 
             AND (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) < (e.total_quantity * 0.2)
        THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_status,
    e.unit_price,
    e.purchase_date,
    e.condition_status,
    e.location,
    e.notes,
    e.is_active,
    e.created_at,
    e.updated_at
FROM equipment e
LEFT JOIN categories c ON e.category_id = c.category_id
LEFT JOIN borrow_records br ON e.equipment_id = br.equipment_id
WHERE e.is_active = TRUE
GROUP BY e.equipment_id, e.equipment_name, e.category_id, c.category_name, 
         e.total_quantity, e.unit_price, e.purchase_date, e.condition_status, 
         e.location, e.notes, e.is_active, e.created_at, e.updated_at;

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

INSERT INTO categories (category_id, category_name, description) VALUES
('CAT-001', 'Balls', 'Basketball, Soccer Ball, Tennis Ball, Volleyball, etc.'),
('CAT-002', 'Rackets & Paddles', 'Tennis Racket, Badminton Racket, Ping Pong Paddle, etc.'),
('CAT-003', 'Protective Gear', 'Helmet, Knee Pads, Elbow Pads, Gloves, etc.'),
('CAT-004', 'Nets & Poles', 'Badminton Net, Volleyball Net, Goal Post, etc.'),
('CAT-005', 'Mats & Floors', 'Yoga Mat, Gym Mat, Exercise Mat, etc.'),
('CAT-006', 'Weights & Resistance', 'Dumbbells, Kettlebells, Resistance Bands, etc.'),
('CAT-007', 'Accessories', 'Cones, Markers, Bags, Whistles, etc.')
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO users (user_id, username, email, full_name, role) VALUES
('USR-001', 'john_smith', 'john@example.com', 'John Smith', 'Admin'),
('USR-002', 'jane_doe', 'jane@example.com', 'Jane Doe', 'Manager'),
('USR-003', 'mike_lee', 'mike@example.com', 'Mike Lee', 'User'),
('USR-004', 'sarah_wilson', 'sarah@example.com', 'Sarah Wilson', 'User')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO equipment (equipment_id, equipment_name, category_id, total_quantity, unit_price, purchase_date, location) VALUES
('EQ-0001', 'Spalding Basketball', 'CAT-001', 25, 45.99, '2025-06-15', 'Storage Room A - Shelf 2'),
('EQ-0002', 'Tennis Ball (Pack)', 'CAT-001', 50, 12.99, '2025-05-20', 'Storage Room B - Shelf 1'),
('EQ-0003', 'Tennis Racket (Adult)', 'CAT-002', 12, 89.99, '2025-07-01', 'Storage Room A - Shelf 4'),
('EQ-0004', 'Badminton Net', 'CAT-004', 5, 34.50, '2025-08-10', 'Outdoor Storage'),
('EQ-0005', 'Yoga Mat (Purple)', 'CAT-005', 30, 25.00, '2025-09-15', 'Gym Storage'),
('EQ-0006', 'Dumbbells (5kg)', 'CAT-006', 50, 15.00, '2025-04-01', 'Weight Room - Rack 1'),
('EQ-0007', 'Safety Helmet (M)', 'CAT-003', 15, 45.00, '2025-10-01', 'Safety Equipment Room')
ON CONFLICT (equipment_id) DO NOTHING;

INSERT INTO borrow_records (borrow_id, equipment_id, borrowed_by, quantity, borrow_date, due_date, return_date) VALUES
('BR-0001', 'EQ-0001', 'USR-003', 3, NOW() - INTERVAL '1 day', CURRENT_DATE + INTERVAL '7 days', NULL),
('BR-0002', 'EQ-0001', 'USR-004', 2, NOW() - INTERVAL '2 days', CURRENT_DATE + INTERVAL '6 days', NULL),
('BR-0003', 'EQ-0001', 'USR-002', 3, NOW() - INTERVAL '4 days', CURRENT_DATE + INTERVAL '3 days', NULL),
('BR-0004', 'EQ-0005', 'USR-003', 5, NOW() - INTERVAL '8 days', CURRENT_DATE - INTERVAL '7 days', NOW() - INTERVAL '6 days'),
('BR-0005', 'EQ-0002', 'USR-004', 10, NOW() - INTERVAL '18 days', CURRENT_DATE + INTERVAL '14 days', NULL)
ON CONFLICT (borrow_id) DO NOTHING;

-- =====================================================
-- VERIFY SETUP
-- =====================================================

SELECT 'Categories created' AS status, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Users created', COUNT(*) FROM users
UNION ALL
SELECT 'Equipment created', COUNT(*) FROM equipment
UNION ALL
SELECT 'Borrow records created', COUNT(*) FROM borrow_records;
