# SPORTS EQUIPMENT AND MONITORING SYSTEM
## Inventory Management System Prompt

---

## System Overview
A comprehensive sports equipment inventory management system designed to track, monitor, and manage sports equipment across facilities. The system automatically calculates equipment availability based on borrowing records.

---

## Core Features

### 1. **Equipment Inventory Management**
- Maintain a centralized database of all sports equipment
- Track equipment status in real-time
- Automatic calculations for availability
- Support for multiple equipment categories

### 2. **Automatic Field Calculations**
- Real-time quantity tracking
- Automatic availability updates
- Dependency-based field population

---

## Data Structure

### Equipment Record Fields

#### Primary Information
| Field | Type | Description | Auto-Filled | Required |
|-------|------|-------------|------------|----------|
| **Equipment ID** | Text/Number | Unique identifier for each equipment item | ❌ | ✅ |
| **Equipment Name** | Text | Name of the equipment (e.g., Basketball, Tennis Racket) | ❌ | ✅ |
| **Category** | Select/Text | Category classification (e.g., Balls, Rackets, Protective Gear, etc.) | ❌ | ✅ |

#### Quantity Fields
| Field | Type | Description | Auto-Filled | Required |
|-------|------|-------------|------------|----------|
| **Total Quantity** | Number | Total number of equipment units in inventory | ❌ | ✅ |
| **Quantity Borrowed** | Number | Number of units currently borrowed | ✅ | ✅ |
| **Quantity Available** | Number | Available units ready for borrowing | ✅ | ✅ |

#### Additional Fields
| Field | Type | Description |
|-------|------|-------------|
| **Unit Price** | Currency | Cost per unit |
| **Purchase Date** | Date | When equipment was acquired |
| **Condition Status** | Select | Good/Fair/Needs Repair |
| **Location** | Text | Physical storage location |
| **Notes** | Text | Additional comments |

---

## Auto-Calculation Rules

### Quantity Borrowed Calculation
```
Quantity Borrowed = SUM(all active borrow records for this equipment)
```
- Updated automatically when:
  - Equipment is borrowed
  - Equipment is returned
  - Borrow record status changes

### Quantity Available Calculation
```
Quantity Available = Total Quantity - Quantity Borrowed
```
- Updated automatically when:
  - Total Quantity changes
  - Quantity Borrowed changes
- **Business Rule:** Should never go below 0

### Status Indicators
- 🟢 **In Stock:** Quantity Available > 0
- 🟡 **Low Stock:** Quantity Available > 0 AND < (Total Quantity × 20%)
- 🔴 **Out of Stock:** Quantity Available = 0
- ⚠️ **Alert:** Negative availability detected (system error)

---

## Functional Requirements

### 1. Equipment Management
- ✅ Create new equipment records
- ✅ Update equipment information
- ✅ Delete/Archive equipment
- ✅ View complete equipment inventory

### 2. Borrowing System Integration
- ✅ Track who borrowed what and when
- ✅ Automatic update of "Quantity Borrowed"
- ✅ Return processing with quantity restoration
- ✅ Overdue tracking

### 3. Reporting & Analytics
- ✅ Equipment utilization reports
- ✅ Stock level alerts
- ✅ Most borrowed items ranking
- ✅ Availability status dashboard

### 4. Validation Rules
- ✅ Equipment ID must be unique
- ✅ Total Quantity must be ≥ 0
- ✅ Quantity Borrowed ≤ Total Quantity
- ✅ Cannot borrow more than available
- ✅ Equipment Name must not be empty

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access - Create, Edit, Delete, View Reports |
| **Staff/Manager** | Manage inventory - Create, Edit, Manage borrowing |
| **User** | View availability, Request/Return equipment |

---

## Sample Equipment Categories

- **Balls** (Basketball, Soccer Ball, Tennis Ball, Volleyball, etc.)
- **Rackets & Paddles** (Tennis Racket, Badminton Racket, Ping Pong Paddle, etc.)
- **Protective Gear** (Helmet, Knee Pads, Elbow Pads, Gloves, etc.)
- **Nets & Poles** (Badminton Net, Volleyball Net, Goal Post, etc.)
- **Mats & Floors** (Yoga Mat, Gym Mat, Exercise Mat, etc.)
- **Weights & Resistance** (Dumbbells, Kettlebells, Resistance Bands, etc.)
- **Accessories** (Cones, Markers, Bags, etc.)

---

## Example Equipment Record

```
Equipment ID:        EQ-0001
Equipment Name:      Spalding Basketball
Category:            Balls
Total Quantity:      25
Quantity Borrowed:   8 (auto-calculated from active borrows)
Quantity Available:  17 (auto-calculated: 25 - 8)
Unit Price:          $45.99
Purchase Date:       2025-06-15
Condition Status:    Good
Location:            Storage Room A - Shelf 2
Notes:               Official size 7, suitable for competitive play
```

---

## System Benefits

✅ **Real-Time Tracking** - Know exactly what's available at any moment
✅ **Reduced Manual Work** - Automatic calculations eliminate human error
✅ **Transparency** - Clear visibility of equipment status
✅ **Accountability** - Track borrowing history and equipment condition
✅ **Optimization** - Identify frequently used and underutilized items
✅ **Cost Control** - Monitor equipment investment and maintain standards

---

## Integration Points

- 📱 Mobile app for borrowing requests
- 📧 Automated notifications for low stock
- 📊 Dashboard with real-time metrics
- 📅 Calendar for event equipment planning
- 🔔 Alert system for overdue returns

---

## Future Enhancements

- [ ] QR code scanning for quick checkout/return
- [ ] Maintenance scheduling
- [ ] Equipment depreciation tracking
- [ ] Multi-facility support
- [ ] Advanced filtering and search
- [ ] Export to CSV/Excel
- [ ] Predictive analytics for equipment purchasing

