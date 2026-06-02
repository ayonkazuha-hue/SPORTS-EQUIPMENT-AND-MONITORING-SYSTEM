# SPORTS EQUIPMENT API - Complete Documentation

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Installation

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=sports_equipment_system

# 3. Install dependencies
npm install

# 4. Set up database
mysql -u root -p < database_setup.sql

# 5. Start server
npm start          # Production mode
npm run dev        # Development mode with auto-reload
```

### Server Running
```
✅ Server running on http://localhost:5000
📖 API Docs: http://localhost:5000/api
🏥 Health: http://localhost:5000/health
```

---

## Core Features

### ✅ Auto-Calculated Fields
- **Quantity Borrowed** - Automatically summed from active borrow records
- **Quantity Available** - Automatically calculated (Total - Borrowed)
- **Stock Status** - Automatically determined (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)

### ✅ Real-Time Updates
All calculations update immediately when:
- Equipment is borrowed
- Equipment is returned
- Total quantity is changed

---

## API Endpoints

### 1. GET /api/equipment
**Get all equipment with auto-calculated quantities**

```bash
curl http://localhost:5000/api/equipment
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "equipment_id": "EQ-0001",
            "equipment_name": "Spalding Basketball",
            "category_id": "CAT-001",
            "category_name": "Balls",
            "total_quantity": 25,
            "quantity_borrowed": 8,
            "quantity_available": 17,
            "stock_status": "IN_STOCK",
            "status_indicator": {
                "icon": "🟢",
                "color": "green",
                "label": "In Stock"
            },
            "usage_percentage": 32,
            "unit_price": 45.99,
            "purchase_date": "2025-06-15",
            "condition_status": "Good",
            "location": "Storage Room A - Shelf 2",
            "notes": "Official size 7",
            "is_active": true,
            "created_date": "2026-06-02T10:00:00.000Z",
            "updated_date": "2026-06-02T14:30:00.000Z"
        }
    ],
    "count": 1
}
```

---

### 2. GET /api/equipment/:equipmentId
**Get single equipment with auto-calculated fields**

```bash
curl http://localhost:5000/api/equipment/EQ-0001
```

**Response:**
```json
{
    "success": true,
    "data": {
        "equipment_id": "EQ-0001",
        "equipment_name": "Spalding Basketball",
        "category_id": "CAT-001",
        "category_name": "Balls",
        "total_quantity": 25,
        "quantity_borrowed": 8,
        "quantity_available": 17,
        "stock_status": "IN_STOCK",
        "status_indicator": {
            "icon": "🟢",
            "color": "green",
            "label": "In Stock"
        },
        "usage_percentage": 32
    }
}
```

---

### 3. POST /api/equipment
**Create new equipment**

```bash
curl -X POST http://localhost:5000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": "EQ-0008",
    "equipment_name": "Soccer Ball",
    "category_id": "CAT-001",
    "total_quantity": 20,
    "unit_price": 29.99,
    "purchase_date": "2025-06-01",
    "condition_status": "Good",
    "location": "Storage Room B",
    "notes": "Professional grade"
  }'
```

**Request Body:**
```json
{
    "equipment_id": "EQ-0008",
    "equipment_name": "Soccer Ball",
    "category_id": "CAT-001",
    "total_quantity": 20,
    "unit_price": 29.99,
    "purchase_date": "2025-06-01",
    "condition_status": "Good",
    "location": "Storage Room B",
    "notes": "Professional grade"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Equipment created successfully",
    "data": {
        "equipment_id": "EQ-0008",
        "equipment_name": "Soccer Ball",
        "category_id": "CAT-001",
        "total_quantity": 20,
        "quantity_borrowed": 0,
        "quantity_available": 20,
        "stock_status": "IN_STOCK",
        "status_indicator": {
            "icon": "🟢",
            "color": "green"
        },
        "created_date": "2026-06-02T15:00:00.000Z"
    }
}
```

---

### 4. PUT /api/equipment/:equipmentId
**Update equipment**

```bash
curl -X PUT http://localhost:5000/api/equipment/EQ-0001 \
  -H "Content-Type: application/json" \
  -d '{
    "total_quantity": 30,
    "condition_status": "Good"
  }'
```

**Request Body:**
```json
{
    "total_quantity": 30,
    "condition_status": "Good"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Equipment updated successfully",
    "data": {
        "equipment_id": "EQ-0001",
        "total_quantity": 30,
        "quantity_borrowed": 8,
        "quantity_available": 22,
        "stock_status": "IN_STOCK"
    }
}
```

**⚠️ Important:** When you update `total_quantity`, `quantity_available` is automatically recalculated!

---

### 5. DELETE /api/equipment/:equipmentId
**Delete equipment (soft delete)**

```bash
curl -X DELETE http://localhost:5000/api/equipment/EQ-0001
```

**Response:**
```json
{
    "success": true,
    "message": "Equipment deleted successfully"
}
```

---

## Borrowing Operations

### 6. POST /api/equipment/borrow
**Borrow equipment (AUTO-UPDATES quantities)**

```bash
curl -X POST http://localhost:5000/api/equipment/borrow \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": "EQ-0001",
    "borrowed_by": "USR-003",
    "quantity": 3,
    "due_date": "2026-06-08"
  }'
```

**Request Body:**
```json
{
    "equipment_id": "EQ-0001",
    "borrowed_by": "USR-003",
    "quantity": 3,
    "due_date": "2026-06-08"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Equipment borrowed successfully. Quantities auto-updated.",
    "data": {
        "borrow_id": "BR-A1B2C3D4",
        "equipment": {
            "equipment_id": "EQ-0001",
            "equipment_name": "Spalding Basketball",
            "total_quantity": 25,
            "quantity_borrowed": 11,
            "quantity_available": 14,
            "stock_status": "IN_STOCK"
        },
        "borrow_info": {
            "quantity_borrowed": 3,
            "due_date": "2026-06-08"
        }
    }
}
```

**⚠️ Auto-Calculations Triggered:**
- `quantity_borrowed` updated from 8 → 11
- `quantity_available` updated from 17 → 14
- `stock_status` updated if needed

---

### 7. PUT /api/equipment/borrow/:borrowId/return
**Return equipment (AUTO-UPDATES quantities)**

```bash
curl -X PUT http://localhost:5000/api/equipment/borrow/BR-A1B2C3D4/return \
  -H "Content-Type: application/json" \
  -d '{
    "condition_at_return": "Good",
    "notes": "Returned in excellent condition"
  }'
```

**Request Body:**
```json
{
    "condition_at_return": "Good",
    "notes": "Returned in excellent condition"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Equipment returned successfully. Quantities auto-updated.",
    "data": {
        "borrow_id": "BR-A1B2C3D4",
        "returned_quantity": 3,
        "equipment": {
            "equipment_id": "EQ-0001",
            "equipment_name": "Spalding Basketball",
            "total_quantity": 25,
            "quantity_borrowed": 8,
            "quantity_available": 17,
            "stock_status": "IN_STOCK"
        }
    }
}
```

**⚠️ Auto-Calculations Triggered:**
- `quantity_borrowed` updated from 11 → 8
- `quantity_available` updated from 14 → 17

---

### 8. GET /api/equipment/borrow/active
**Get all active borrow records**

```bash
curl http://localhost:5000/api/equipment/borrow/active
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "borrow_id": "BR-0001",
            "equipment_id": "EQ-0001",
            "equipment_name": "Spalding Basketball",
            "borrowed_by": "USR-003",
            "full_name": "Mike Lee",
            "quantity": 3,
            "borrow_date": "2026-06-01T10:00:00.000Z",
            "due_date": "2026-06-08",
            "return_date": null,
            "days_remaining": 6,
            "is_overdue": false
        }
    ],
    "count": 1
}
```

---

### 9. GET /api/equipment/:equipmentId/borrow-history
**Get borrow history for equipment**

```bash
curl http://localhost:5000/api/equipment/EQ-0001/borrow-history
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "borrow_id": "BR-0004",
            "equipment_id": "EQ-0001",
            "equipment_name": "Spalding Basketball",
            "borrowed_by": "USR-002",
            "full_name": "Jane Doe",
            "quantity": 2,
            "borrow_date": "2026-05-31T14:30:00.000Z",
            "due_date": "2026-06-07",
            "return_date": null,
            "condition_at_return": null,
            "notes": null
        },
        {
            "borrow_id": "BR-0005",
            "equipment_id": "EQ-0001",
            "borrowed_by": "USR-004",
            "full_name": "Sarah Wilson",
            "quantity": 5,
            "borrow_date": "2026-05-25T16:45:00.000Z",
            "due_date": "2026-06-01",
            "return_date": "2026-06-02T10:00:00.000Z",
            "condition_at_return": "Good",
            "notes": "Returned on time"
        }
    ],
    "count": 2
}
```

---

## Error Responses

### Validation Error (400)
```json
{
    "success": false,
    "error": "Validation failed",
    "errors": {
        "equipment_id": "Equipment ID is required",
        "total_quantity": "Total quantity must be a number"
    }
}
```

### Equipment Not Found (404)
```json
{
    "success": false,
    "error": "Equipment not found"
}
```

### Insufficient Quantity (400)
```json
{
    "success": false,
    "error": "Cannot borrow 10. Only 5 available."
}
```

### Duplicate Equipment ID (409)
```json
{
    "success": false,
    "error": "Equipment ID already exists"
}
```

---

## Validation Rules

### Equipment Creation/Update
- **equipment_id** - Required, unique, alphanumeric + hyphens only, max 50 chars
- **equipment_name** - Required, max 255 chars
- **category_id** - Required, must exist in categories table
- **total_quantity** - Required, whole number, 0-999,999
- **unit_price** - Optional, decimal, max 999,999.99
- **purchase_date** - Optional, cannot be future date

### Borrowing
- **quantity** - Required, must be > 0 and ≤ quantity_available
- **due_date** - Required, cannot be past date
- **borrowed_by** - Required, must be valid user_id

---

## Auto-Calculation Flow

### When Equipment is Borrowed:
```
1. Create borrow record
2. Query: SUM all active borrow records for this equipment
3. Calculate: Quantity Borrowed = sum result
4. Calculate: Quantity Available = Total - Quantity Borrowed
5. Update equipment quantities
6. Return updated equipment with auto-calculated fields
```

### When Equipment is Returned:
```
1. Mark borrow record as returned
2. Query: SUM all remaining active borrow records for this equipment
3. Calculate: Quantity Borrowed = sum result
4. Calculate: Quantity Available = Total - Quantity Borrowed
5. Update equipment quantities
6. Return updated equipment with auto-calculated fields
```

---

## Database Queries (For Reference)

### Get Quantity Borrowed
```sql
SELECT COALESCE(SUM(quantity), 0) AS quantity_borrowed
FROM borrow_records
WHERE equipment_id = 'EQ-0001'
AND return_date IS NULL;
```

### Get Quantity Available
```sql
SELECT total_quantity - COALESCE(SUM(br.quantity), 0) AS quantity_available
FROM equipment e
LEFT JOIN borrow_records br ON e.equipment_id = br.equipment_id 
                            AND br.return_date IS NULL
WHERE e.equipment_id = 'EQ-0001'
GROUP BY e.total_quantity;
```

### Get Equipment with All Calculations
```sql
SELECT 
    e.equipment_id,
    e.total_quantity,
    COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0) AS quantity_borrowed,
    (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) AS quantity_available,
    CASE 
        WHEN (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) = 0 
        THEN 'OUT_OF_STOCK'
        WHEN (e.total_quantity - COALESCE(SUM(CASE WHEN br.return_date IS NULL THEN br.quantity ELSE 0 END), 0)) < (e.total_quantity * 0.2)
        THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_status
FROM equipment e
LEFT JOIN borrow_records br ON e.equipment_id = br.equipment_id
WHERE e.equipment_id = 'EQ-0001'
GROUP BY e.equipment_id, e.total_quantity;
```

---

## Testing with cURL

### Create Equipment
```bash
curl -X POST http://localhost:5000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{"equipment_id":"EQ-TEST","equipment_name":"Test Equipment","category_id":"CAT-001","total_quantity":50}'
```

### Borrow Equipment
```bash
curl -X POST http://localhost:5000/api/equipment/borrow \
  -H "Content-Type: application/json" \
  -d '{"equipment_id":"EQ-0001","borrowed_by":"USR-001","quantity":5,"due_date":"2026-06-10"}'
```

### Check Equipment (Auto-Calculations)
```bash
curl http://localhost:5000/api/equipment/EQ-0001 | jq '.data | {quantity_borrowed, quantity_available, stock_status}'
```

---

## Support & Resources

- 📖 Full Documentation: See SYSTEM_PROMPT.md
- 🗄️ Database Schema: See DATABASE_SCHEMA.md  
- 🎨 UI/UX Workflows: See UI_WORKFLOWS.md
- 📋 Implementation Guide: See IMPLEMENTATION_GUIDE.md

---

**API Version:** 1.0.0  
**Last Updated:** June 2, 2026  
**Auto-Calculations:** ✅ Enabled
