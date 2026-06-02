# Database Schema & Technical Specification
## SPORTS EQUIPMENT AND MONITORING SYSTEM

---

## Database Tables

### 1. Equipment Table
```sql
CREATE TABLE Equipment (
    EquipmentID VARCHAR(50) PRIMARY KEY,
    EquipmentName VARCHAR(255) NOT NULL,
    Category VARCHAR(100) NOT NULL,
    TotalQuantity INT NOT NULL CHECK (TotalQuantity >= 0),
    QuantityBorrowed INT GENERATED ALWAYS AS (
        COALESCE((SELECT SUM(quantity) FROM BorrowRecords 
                  WHERE equipment_id = Equipment.EquipmentID 
                  AND return_date IS NULL), 0)
    ) STORED,
    QuantityAvailable INT GENERATED ALWAYS AS (
        TotalQuantity - COALESCE((SELECT SUM(quantity) FROM BorrowRecords 
                                   WHERE equipment_id = Equipment.EquipmentID 
                                   AND return_date IS NULL), 0)
    ) STORED,
    UnitPrice DECIMAL(10, 2),
    PurchaseDate DATE,
    ConditionStatus VARCHAR(50),
    Location VARCHAR(255),
    Notes TEXT,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
);
```

### 2. Borrow Records Table
```sql
CREATE TABLE BorrowRecords (
    BorrowID VARCHAR(50) PRIMARY KEY,
    EquipmentID VARCHAR(50) NOT NULL,
    BorrowedBy VARCHAR(100) NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    BorrowDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    DueDate DATE NOT NULL,
    ReturnDate DATETIME,
    Condition VARCHAR(50),
    Notes TEXT,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID)
);
```

### 3. Categories Table
```sql
CREATE TABLE Categories (
    CategoryID VARCHAR(50) PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Users Table
```sql
CREATE TABLE Users (
    UserID VARCHAR(50) PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(100),
    Role VARCHAR(50), -- Admin, Staff, User
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Form Fields Layout

### Equipment Create/Edit Form

```
┌─────────────────────────────────────────────┐
│     Equipment Inventory Form                │
├─────────────────────────────────────────────┤
│                                             │
│ Equipment ID: [__________________]          │
│ (Required - Unique identifier)              │
│                                             │
│ Equipment Name: [__________________]        │
│ (Required)                                  │
│                                             │
│ Category: [▼ Select Category]               │
│ (Required - Balls / Rackets / Etc)          │
│                                             │
│ ─────────────────────────────────────────  │
│ QUANTITY SECTION                            │
│ ─────────────────────────────────────────  │
│                                             │
│ Total Quantity: [__________]                │
│ (Required - Manual Entry)                   │
│                                             │
│ Quantity Borrowed: [__________]  [Read-Only]│
│ (Auto-calculated from active borrows)       │
│                                             │
│ Quantity Available: [__________]  [Read-Only]│
│ (Auto-calculated: Total - Borrowed)         │
│                                             │
│ ─────────────────────────────────────────  │
│ ADDITIONAL INFORMATION                      │
│ ─────────────────────────────────────────  │
│                                             │
│ Unit Price: $[__________]                   │
│                                             │
│ Purchase Date: [__/__/____]                 │
│                                             │
│ Condition Status: [▼ Good/Fair/Repair]      │
│                                             │
│ Location: [__________________]              │
│                                             │
│ Notes: [________________________]            │
│        [________________________]            │
│                                             │
│  [ Save ]  [ Cancel ]  [ Delete ]           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## API Endpoints

### Equipment Management
```
GET    /api/equipment              - List all equipment
GET    /api/equipment/{id}         - Get equipment details
POST   /api/equipment              - Create new equipment
PUT    /api/equipment/{id}         - Update equipment
DELETE /api/equipment/{id}         - Delete equipment
GET    /api/equipment/search       - Search equipment
```

### Borrowing
```
POST   /api/borrow                 - Create borrow record
PUT    /api/borrow/{id}/return     - Return equipment
GET    /api/borrow/active          - Get active borrows
GET    /api/borrow/history         - Get borrow history
```

### Reports
```
GET    /api/reports/availability   - Stock level report
GET    /api/reports/utilization    - Usage statistics
GET    /api/reports/overdue        - Overdue items
```

---

## Calculation Logic

### JavaScript/Frontend Example

```javascript
// Auto-update when Total Quantity changes
function updateAvailability() {
    const totalQuantity = parseInt(document.getElementById('totalQty').value) || 0;
    const quantityBorrowed = parseInt(document.getElementById('borrowedQty').value) || 0;
    const quantityAvailable = totalQuantity - quantityBorrowed;
    
    document.getElementById('availableQty').value = Math.max(0, quantityAvailable);
}

// Event listeners
document.getElementById('totalQty').addEventListener('change', updateAvailability);
document.getElementById('borrowedQty').addEventListener('change', updateAvailability);

// On form load - fetch borrowed quantity from database
async function loadEquipmentData(equipmentId) {
    const response = await fetch(`/api/equipment/${equipmentId}`);
    const data = await response.json();
    
    document.getElementById('totalQty').value = data.totalQuantity;
    document.getElementById('borrowedQty').value = data.quantityBorrowed; // from DB calculation
    document.getElementById('availableQty').value = data.quantityAvailable; // from DB calculation
}
```

---

## Validation Rules (Frontend & Backend)

```
Equipment ID:
- Must be unique
- Cannot be empty
- Alphanumeric, no special characters

Equipment Name:
- Cannot be empty
- Max 255 characters

Category:
- Must select from predefined list
- Cannot be null

Total Quantity:
- Must be number ≥ 0
- Cannot be decimal
- Max 999,999

Quantity Borrowed:
- Auto-calculated (no manual entry)
- Must be ≤ Total Quantity

Quantity Available:
- Auto-calculated (no manual entry)
- Must be ≥ 0
- Formula: Total - Borrowed

Purchase Date:
- Must be valid date
- Cannot be future date
```

---

## Status Indicators & Color Coding

```
Stock Status Colors:
🟢 GREEN  - Quantity Available > 0
🟡 YELLOW - Quantity Available > 0 AND < (Total × 20%)
🔴 RED    - Quantity Available = 0
⚠️  ALERT  - Quantity Borrowed > Total Quantity (System Error)

Condition Status:
✅ Good       - Equipment in perfect working condition
⚠️  Fair       - Minor wear, fully functional
🔧 Needs Repair - Not available for use
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│         User Creates/Updates Equipment Record           │
├──────────────────────────────────────────────────────────┤
│ Input: Equipment ID, Name, Category, Total Quantity      │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
         ┌──────────────────────────┐
         │   Database Storage       │
         │ (Equipment Table)        │
         └─────────────┬────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────────┐  ┌──────────────────────┐
│  Calculate Quantity  │  │   Fetch Active Borrow│
│  Borrowed from       │  │   Records            │
│  Active Borrow Recs  │  │                      │
└──────────┬───────────┘  └──────────┬───────────┘
           │                         │
           └─────────────┬───────────┘
                         │
                         ▼
            ┌──────────────────────────┐
            │ Calculate Quantity       │
            │ Available = Total -      │
            │ Borrowed                 │
            └────────────┬─────────────┘
                         │
                         ▼
         ┌──────────────────────────────┐
         │  Update Equipment Record     │
         │  Display to User             │
         └──────────────────────────────┘
```

---

## Performance Considerations

- Index on EquipmentID (primary key)
- Index on Category (for filtering)
- Index on BorrowRecords.EquipmentID (for joins)
- Index on BorrowRecords.ReturnDate (for active records)
- Cache calculated fields if database doesn't support generated columns

