# User Interface & Workflows
## SPORTS EQUIPMENT AND MONITORING SYSTEM

---

## Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│ SPORTS EQUIPMENT & MONITORING SYSTEM - Dashboard                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Welcome, [User Name]  |  My Dashboard  |  Equipment  |  Reports    │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌──────────────────────┐  ┌──────────────────────┐                 │
│ │  Total Equipment     │  │  In Stock            │                 │
│ │      156             │  │      142             │                 │
│ └──────────────────────┘  └──────────────────────┘                 │
│                                                                      │
│ ┌──────────────────────┐  ┌──────────────────────┐                 │
│ │  Out of Stock        │  │  Currently Borrowed  │                 │
│ │       5              │  │       78             │                 │
│ └──────────────────────┘  └──────────────────────┘                 │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ⚠️  ALERTS & NOTIFICATIONS                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🔴 Tennis Rackets - Out of Stock                             │  │
│  │ 🟡 Basketballs - Low Stock (3 of 25)                         │  │
│  │ 🔔 Overdue Return: Volleyball (2 days)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📊 RECENT ACTIVITY                                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Equipment Name      │ Action    │ Quantity │ By        │ Time   │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ Basketball          │ Borrowed  │ 3        │ John Smith│ 2h ago │
│  │ Yoga Mat            │ Returned  │ 5        │ Jane Doe  │ 4h ago │
│  │ Dumbbells (10kg)    │ Borrowed  │ 2        │ Mike Lee  │ 6h ago │
│  │ Badminton Net       │ Returned  │ 1        │ Sarah Q.  │ 1d ago │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Equipment List View

```
┌─────────────────────────────────────────────────────────────────────┐
│ EQUIPMENT INVENTORY                                  [+ New]  [🔍]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Category Filter: [▼ All Categories] | [🔄 Reset]                   │
│ Search: [_____________________]                                      │
│                                                                      │
├──────────┬──────────────────┬──────────┬────────┬────────┬────────┤
│ Status   │ Equipment Name   │ Category │ Total  │Borrowed│Available│
├──────────┼──────────────────┼──────────┼────────┼────────┼────────┤
│ 🟢       │ Basketball       │ Balls    │   25   │   8    │   17   │
│ 🟡       │ Tennis Racket    │ Rackets  │   12   │  10    │    2   │
│ 🔴       │ Badminton Net    │ Nets     │    5   │   5    │    0   │
│ 🟢       │ Yoga Mat         │ Mats     │   30   │  12    │   18   │
│ 🟢       │ Dumbbells (5kg)  │ Weights  │   50   │  25    │   25   │
│ 🟡       │ Helmet (M)       │ Gear     │   15   │  13    │    2   │
│          │                  │          │        │        │        │
│ [Scroll: More items...]                                             │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Total Items: 156  │  In Stock: 142  │  Out of Stock: 5             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Equipment Detail & Edit Form

```
┌──────────────────────────────────────────────────────────────────────┐
│ EQUIPMENT DETAILS - Basketball                       [Edit] [Delete] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ BASIC INFORMATION                                                    │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Equipment ID:        EQ-0001                                   │  │
│ │ Equipment Name:      Basketball (Spalding)                    │  │
│ │ Category:            Balls                                     │  │
│ │ Condition Status:    🟢 Good                                   │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│ INVENTORY STATUS                                                     │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │                                                                │  │
│ │  Total Quantity:        25  ────────  [Manual Entry Only]     │  │
│ │                                                                │  │
│ │  Quantity Borrowed:      8  ▓▓▓▓▓░░░░░░ [Auto-Calculated]    │  │
│ │                                                                │  │
│ │  Quantity Available:    17  ▓▓▓▓▓▓▓▓▓░░ [Auto-Calculated]    │  │
│ │                                                                │  │
│ │  Stock Status:          🟢 IN STOCK (68%)                     │  │
│ │                                                                │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│ ADDITIONAL INFORMATION                                               │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Unit Price:          $45.99                                    │  │
│ │ Purchase Date:       2025-06-15                                │  │
│ │ Location:            Storage Room A - Shelf 2                  │  │
│ │ Notes:               Official size 7, suitable for competitive │  │
│ │                      play                                      │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│ BORROW HISTORY                                                       │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Active Borrows:                                                │  │
│ │  • John Smith - 3 units (Borrowed: 6/1/2026 | Due: 6/8/2026) │  │
│ │  • Jane Doe - 2 units (Borrowed: 5/31/2026 | Due: 6/7/2026)  │  │
│ │  • Mike Lee - 3 units (Borrowed: 5/29/2026 | Due: 6/5/2026) ✓│  │
│ │                                                                │  │
│ │ [View Full History]                                            │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  [ Edit ]  [ Borrow ]  [ Report ]  [ Close ]                        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Borrowing Workflow

### Step 1: Create Borrow Request

```
┌──────────────────────────────────────────────────┐
│    Borrow Equipment                              │
├──────────────────────────────────────────────────┤
│                                                  │
│ Select Equipment: [▼ Basketball        ]  [EQ-01]│
│                                                  │
│ Current Status:                                  │
│  • Total: 25  | Borrowed: 8  | Available: 17    │
│                                                  │
│ Quantity to Borrow: [____]  (Max: 17)            │
│                                                  │
│ Borrowed By: [John Smith           ] (Pre-filled)│
│                                                  │
│ Borrow Date: [6/2/2026           ] (Auto)        │
│                                                  │
│ Expected Return Date: [6/9/2026]                 │
│                                                  │
│ Purpose: [________________________________]      │
│          [________________________________]      │
│                                                  │
│ [ Confirm Borrow ]  [ Cancel ]                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Step 2: Automatic Update

```
SYSTEM PROCESSING...

Basketball (EQ-0001):
  Old Values:
    ├─ Total Quantity: 25
    ├─ Quantity Borrowed: 8
    └─ Quantity Available: 17

  ✓ New Borrow Record Created (3 units to John Smith)

  New Values:
    ├─ Total Quantity: 25 (unchanged)
    ├─ Quantity Borrowed: 11 (8 + 3) ✓ AUTO-UPDATED
    └─ Quantity Available: 14 (25 - 11) ✓ AUTO-UPDATED

  Status Changed: 🟢 (68% → 56%)

✓ SUCCESS - Equipment has been borrowed
```

---

## Return Workflow

```
┌──────────────────────────────────────────────────┐
│    Return Equipment                              │
├──────────────────────────────────────────────────┤
│                                                  │
│ Active Borrow Record:                            │
│ ┌──────────────────────────────────────────────┐│
│ │ Basketball (EQ-0001)                         ││
│ │ Borrowed By: John Smith                      ││
│ │ Quantity: 3 units                            ││
│ │ Borrow Date: 6/2/2026                        ││
│ │ Due Date: 6/9/2026                           ││
│ │ Status: 🟢 On Time                           ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ Quantity to Return: [3]  (Max: 3)                │
│                                                  │
│ Equipment Condition: [▼ Good        ]            │
│                      • Good                     │
│                      • Fair                     │
│                      • Needs Repair             │
│                                                  │
│ Return Notes: [____________________________]     │
│               [____________________________]     │
│                                                  │
│ [ Confirm Return ]  [ Cancel ]                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Reports Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ REPORTS & ANALYTICS                                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ [Stock Levels] [Utilization] [Overdue] [History] [Export]       │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ STOCK LEVEL REPORT                                               │
│                                                                   │
│ Equipment              │ Category   │ Total │ Borrowed │ Available│
│ ───────────────────────┼────────────┼───────┼──────────┼─────────│
│ Basketball             │ Balls      │  25   │    8     │   17    │
│ Tennis Ball            │ Balls      │  50   │   45     │    5    │
│ Badminton Net          │ Nets       │   5   │    5     │    0    │
│ Yoga Mat               │ Mats       │  30   │   12     │   18    │
│                                                                   │
│ 📊 UTILIZATION CHART                                             │
│                                                                   │
│  Basketball      ████████░ 32%                                   │
│  Tennis Ball     █████████░ 90%                                  │
│  Badminton Net   ██████████ 100%                                 │
│  Yoga Mat        ██████░░░ 40%                                   │
│  Dumbbells       █████████░ 50%                                  │
│                                                                   │
│ [ Download Report ] [ Print ] [ Email ]                          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key User Workflows

### Workflow 1: Add New Equipment
```
1. Click [+ New Equipment]
2. Enter Equipment ID, Name, Category
3. Enter Total Quantity (e.g., 25)
4. Fill optional fields (Price, Location, Notes)
5. Click Save
6. System auto-sets:
   - Quantity Borrowed: 0 (no active borrows)
   - Quantity Available: 25 (25 - 0)
7. Equipment appears in list with 🟢 IN STOCK status
```

### Workflow 2: Borrow Equipment
```
1. Find equipment in list
2. Check Quantity Available
3. Click [Borrow] button
4. Select quantity and borrower details
5. Set return date
6. Confirm
7. System auto-updates:
   - Quantity Borrowed: increased
   - Quantity Available: decreased
   - Status: updated if needed
```

### Workflow 3: Return Equipment
```
1. Go to [Active Borrows]
2. Find the borrow record
3. Click [Return]
4. Confirm quantity and condition
5. Submit
6. System auto-updates:
   - Quantity Borrowed: decreased
   - Quantity Available: increased
   - Status: updated
   - Record marked as returned
```

### Workflow 4: Monitor Stock Levels
```
1. Check Dashboard for alerts
2. View Equipment List
3. Filter by stock status (Low/Out)
4. Use Reports > Stock Levels
5. Identify items needing replenishment
6. Plan purchasing based on data
```

---

## System Features Summary

| Feature | Description | Auto-Filled? |
|---------|-------------|-------------|
| Equipment ID | Unique identifier | ❌ |
| Equipment Name | Name of equipment | ❌ |
| Category | Classification | ❌ |
| Total Quantity | Number of units owned | ❌ |
| **Quantity Borrowed** | Units currently out | ✅ Yes (from borrow records) |
| **Quantity Available** | Units ready for use | ✅ Yes (Total - Borrowed) |
| Real-time Updates | Live status changes | ✅ Yes |
| Stock Alerts | Low/Out of stock notifications | ✅ Yes |
| Borrow History | Track all transactions | ✅ Yes (automatic) |
| Usage Reports | Analytics & insights | ✅ Yes (auto-generated) |

