# Implementation Guidelines & Best Practices
## SPORTS EQUIPMENT AND MONITORING SYSTEM

---

## Quick Reference Card

### Core Data Structure

```yaml
Equipment Record:
  Primary Fields (Required):
    - Equipment ID: Unique identifier
    - Equipment Name: Name of equipment
    - Category: Classification
    - Total Quantity: Number of units (manual entry)
  
  Auto-Calculated Fields:
    - Quantity Borrowed: SUM(active borrow records)
    - Quantity Available: Total Quantity - Quantity Borrowed
  
  Status Indicators:
    - 🟢 In Stock: Available > 0
    - 🟡 Low Stock: Available > 0 AND < (Total × 20%)
    - 🔴 Out of Stock: Available = 0
```

---

## Implementation Checklist

### Phase 1: Setup & Configuration
- [ ] Define database structure (Tables: Equipment, BorrowRecords, Categories, Users)
- [ ] Create Equipment Categories
- [ ] Set up user roles and permissions
- [ ] Configure auto-calculation rules
- [ ] Set up validation rules

### Phase 2: Core Functionality
- [ ] Build Equipment List view
- [ ] Create Equipment Add/Edit form
- [ ] Implement auto-calculation of Quantity Borrowed & Available
- [ ] Build Borrow workflow
- [ ] Build Return workflow
- [ ] Create search and filter functionality

### Phase 3: Monitoring & Reporting
- [ ] Build Dashboard with key metrics
- [ ] Create Stock Level reports
- [ ] Implement Alert system
- [ ] Build Utilization reports
- [ ] Add Borrow History tracking

### Phase 4: Advanced Features
- [ ] Overdue detection & notifications
- [ ] Multi-facility support
- [ ] QR code scanning (optional)
- [ ] Mobile app (optional)
- [ ] Export functionality

---

## Development Standards

### Naming Conventions

**Database:**
```
Tables: PascalCase (Equipment, BorrowRecords, Categories)
Columns: PascalCase (EquipmentID, EquipmentName, TotalQuantity)
Primary Keys: ID suffix (EquipmentID, BorrowID)
Foreign Keys: TableName + ID (EquipmentID in BorrowRecords)
```

**Frontend:**
```
Variables: camelCase (totalQuantity, equipmentList)
Functions: camelCase (updateAvailability, fetchEquipment)
Classes: PascalCase (EquipmentForm, Dashboard)
IDs/Classes: kebab-case (equipment-list, borrow-button)
```

### Code Example Structure

**Calculate Quantity Available (Should appear in database layer)**

```javascript
// Calculate as derived field
function calculateQuantityAvailable(totalQuantity, quantityBorrowed) {
    const available = totalQuantity - quantityBorrowed;
    return Math.max(0, available); // Never negative
}

// Usage
const quantityAvailable = calculateQuantityAvailable(25, 8); // Returns 17
```

**Update on Borrow**

```javascript
async function borrowEquipment(equipmentId, quantity, borrowedBy, dueDate) {
    // Create borrow record
    const borrowRecord = await createBorrowRecord({
        equipmentId,
        quantity,
        borrowedBy,
        borrowDate: new Date(),
        dueDate
    });

    // Trigger recalculation
    const equipment = await getEquipment(equipmentId);
    const totalBorrowed = await getTotalBorrowedQuantity(equipmentId);
    const available = equipment.totalQuantity - totalBorrowed;

    // Update UI
    updateEquipmentDisplay({
        quantityBorrowed: totalBorrowed,
        quantityAvailable: available,
        status: getStatusIndicator(available, equipment.totalQuantity)
    });

    return borrowRecord;
}
```

---

## Validation Rules Implementation

### Backend Validation

```javascript
const equipmentValidation = {
    equipmentId: {
        required: true,
        unique: true,
        pattern: /^[A-Z0-9-]+$/,
        message: "Equipment ID must be unique and contain only letters, numbers, and hyphens"
    },
    equipmentName: {
        required: true,
        maxLength: 255,
        message: "Equipment name is required and must be less than 255 characters"
    },
    category: {
        required: true,
        enum: ['Balls', 'Rackets', 'Protective Gear', 'Nets & Poles', 'Mats', 'Weights', 'Accessories'],
        message: "Valid category must be selected"
    },
    totalQuantity: {
        required: true,
        type: 'integer',
        min: 0,
        max: 999999,
        message: "Total quantity must be a whole number between 0 and 999,999"
    }
};
```

### Frontend Validation

```javascript
function validateEquipmentForm(formData) {
    const errors = {};
    
    if (!formData.equipmentId?.trim()) {
        errors.equipmentId = "Equipment ID is required";
    }
    
    if (!formData.equipmentName?.trim()) {
        errors.equipmentName = "Equipment name is required";
    }
    
    if (!formData.category) {
        errors.category = "Please select a category";
    }
    
    const qty = parseInt(formData.totalQuantity);
    if (isNaN(qty) || qty < 0) {
        errors.totalQuantity = "Total quantity must be a non-negative number";
    }
    
    return Object.keys(errors).length === 0 ? null : errors;
}
```

---

## Auto-Calculation Logic

### Key Principles

1. **Quantity Borrowed is always calculated from active borrow records**
   - Never allow manual entry
   - Update when: Borrow created, Borrow returned, Status changes

2. **Quantity Available is always calculated from Total - Borrowed**
   - Automatically derived field
   - Update when: Total Quantity changes, Quantity Borrowed changes

3. **Status is determined by availability percentage**
   - 0% available = 🔴 Red (Out of Stock)
   - 1-20% available = 🟡 Yellow (Low Stock)
   - >20% available = 🟢 Green (In Stock)

### Calculation Points

```
When user enters/changes TOTAL QUANTITY:
  1. Validate input
  2. Save to database
  3. Fetch current Quantity Borrowed (sum of active borrows)
  4. Calculate: Available = Total - Borrowed
  5. Update UI
  6. Trigger alert if needed

When borrow is CREATED:
  1. Create borrow record in database
  2. Fetch Equipment
  3. Recalculate Quantity Borrowed (sum all active)
  4. Recalculate Quantity Available (Total - Borrowed)
  5. Update Equipment record
  6. Refresh UI
  7. Check for low stock alert

When borrow is RETURNED:
  1. Mark borrow record as returned
  2. Save return date and condition
  3. Fetch Equipment
  4. Recalculate Quantity Borrowed (sum remaining active)
  5. Recalculate Quantity Available (Total - Borrowed)
  6. Update Equipment record
  7. Refresh UI
```

---

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_equipment_category ON Equipment(Category);
CREATE INDEX idx_equipment_active ON Equipment(IsActive);
CREATE INDEX idx_borrow_equipment_return ON BorrowRecords(EquipmentID, ReturnDate);
CREATE INDEX idx_borrow_active ON BorrowRecords(EquipmentID, ReturnDate) 
WHERE ReturnDate IS NULL;

-- Use generated/computed columns for auto-calculations (if supported)
ALTER TABLE Equipment 
ADD QuantityBorrowed INT GENERATED ALWAYS AS (
    COALESCE((SELECT COUNT(*) FROM BorrowRecords 
              WHERE EquipmentID = Equipment.EquipmentID 
              AND ReturnDate IS NULL), 0)
) STORED;
```

### Caching Strategy

```javascript
// Cache equipment list (refresh every 5 minutes or on change)
class EquipmentCache {
    constructor() {
        this.cache = null;
        this.lastUpdate = null;
        this.ttl = 5 * 60 * 1000; // 5 minutes
    }

    async get() {
        const now = Date.now();
        if (this.cache && (now - this.lastUpdate) < this.ttl) {
            return this.cache; // Return cached data
        }
        
        // Fetch fresh data
        this.cache = await fetch('/api/equipment').then(r => r.json());
        this.lastUpdate = now;
        return this.cache;
    }

    invalidate() {
        this.cache = null;
        this.lastUpdate = null;
    }
}
```

---

## Common Issues & Solutions

### Issue: Quantity Available goes negative

**Cause:** Manual database manipulation or concurrent requests

**Solution:**
```javascript
// Always validate before saving
function validateBorrow(equipment, quantityToBorrow) {
    if (quantityToBorrow > equipment.quantityAvailable) {
        throw new Error(
            `Cannot borrow ${quantityToBorrow}. Only ${equipment.quantityAvailable} available.`
        );
    }
}
```

### Issue: Quantity Borrowed doesn't update after return

**Cause:** Cache not invalidated, calculation not triggered

**Solution:**
```javascript
async function returnEquipment(borrowId) {
    // Mark as returned
    await updateBorrowRecord(borrowId, { returnDate: new Date() });
    
    // Invalidate cache
    equipmentCache.invalidate();
    
    // Recalculate
    const equipment = await getEquipmentWithCalculations(borrowId.equipmentId);
    
    // Broadcast update to all connected clients
    broadcastEquipmentUpdate(equipment);
}
```

### Issue: Race conditions in concurrent borrows

**Cause:** Multiple simultaneous borrow requests

**Solution:**
```javascript
// Use database transaction and locking
async function borrowEquipmentSafe(equipmentId, quantity) {
    return await database.transaction(async (trx) => {
        // Lock equipment row for update
        const equipment = await trx('Equipment')
            .where('EquipmentID', equipmentId)
            .forUpdate()
            .first();

        // Check current available
        const available = await getAvailableCount(equipment, trx);
        
        if (available < quantity) {
            throw new Error('Insufficient quantity');
        }

        // Create borrow record
        return await trx('BorrowRecords').insert({
            equipmentId,
            quantity,
            // ... other fields
        });
    });
}
```

---

## Testing Checklist

### Unit Tests

- [ ] `calculateQuantityAvailable()` returns correct value
- [ ] `calculateQuantityAvailable()` never returns negative
- [ ] `validateTotalQuantity()` rejects invalid inputs
- [ ] `validateBorrowQuantity()` prevents over-borrowing
- [ ] Status indicator returns correct color

### Integration Tests

- [ ] Create equipment → fields auto-populate correctly
- [ ] Borrow equipment → Quantity Borrowed & Available update
- [ ] Return equipment → Quantity Borrowed & Available update
- [ ] Multiple sequential borrows → quantities accurate
- [ ] Multiple concurrent borrows → no race conditions

### User Acceptance Tests

- [ ] User can create new equipment
- [ ] User can see accurate available quantity
- [ ] User cannot borrow more than available
- [ ] User receives alert when stock is low
- [ ] User can view complete borrow history
- [ ] Returned equipment shows correct condition

---

## API Documentation

### Get Equipment with Auto-Calculated Fields

```
GET /api/equipment/{id}

Response:
{
    "equipmentId": "EQ-0001",
    "equipmentName": "Basketball",
    "category": "Balls",
    "totalQuantity": 25,
    "quantityBorrowed": 8,        // Auto-calculated
    "quantityAvailable": 17,      // Auto-calculated
    "stockStatus": "IN_STOCK",    // Auto-calculated
    "unitPrice": 45.99,
    "location": "Storage Room A",
    "condition": "Good",
    "lastUpdated": "2026-06-02T14:30:00Z"
}
```

### Create Borrow Record

```
POST /api/borrow

Request:
{
    "equipmentId": "EQ-0001",
    "quantity": 3,
    "borrowedBy": "John Smith",
    "dueDate": "2026-06-09"
}

Response:
{
    "borrowId": "BR-0001",
    "equipmentId": "EQ-0001",
    "quantity": 3,
    "borrowedBy": "John Smith",
    "borrowDate": "2026-06-02",
    "dueDate": "2026-06-09",
    "status": "ACTIVE"
}

Side Effects:
  - Equipment.QuantityBorrowed updated
  - Equipment.QuantityAvailable updated
  - Alert generated if low stock
```

---

## Deployment Checklist

- [ ] Database schema created and indexed
- [ ] Environment variables configured
- [ ] Auto-calculation logic deployed
- [ ] Validation rules active
- [ ] Alert system configured
- [ ] Backup strategy implemented
- [ ] Performance tested under load
- [ ] User roles and permissions configured
- [ ] Documentation deployed
- [ ] User training completed

