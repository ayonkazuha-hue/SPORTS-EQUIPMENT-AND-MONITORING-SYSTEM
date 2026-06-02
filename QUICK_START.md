# 🚀 SPORTS EQUIPMENT SYSTEM - Quick Start Guide

## 📋 Project Structure

```
sports-equipment-system/
├── server.js                    # Main Express server
├── package.json                 # Node.js dependencies
├── .env.example                 # Environment variables template
├── setup.sh                     # Setup script
│
├── config/
│   └── database.js             # MySQL connection pool
│
├── routes/
│   └── equipmentRoutes.js       # API endpoints
│
├── controllers/
│   └── equipmentController.js   # Business logic
│
├── utils/
│   ├── calculations.js         # Auto-calculation functions
│   └── validators.js           # Input validation
│
├── database_setup.sql          # MySQL schema and sample data
│
├── README.md                   # Project overview
├── SYSTEM_PROMPT.md           # System specification
├── DATABASE_SCHEMA.md         # Database design details
├── UI_WORKFLOWS.md            # User interface flows
├── IMPLEMENTATION_GUIDE.md    # Development standards
└── API_DOCUMENTATION.md       # This file
```

---

## ⚡ Quick Start - Choose Your Database

### Option A: MySQL (Local Development)

#### Step 1: Prerequisites
```bash
# Verify Node.js
node --version  # Should be v14+
npm --version

# Verify MySQL is running
# Windows: Services → MySQL Server
# Mac: System Preferences → MySQL
# Linux: sudo systemctl status mysql
```

#### Step 2: Setup
```bash
# Navigate to project
cd "c:\Users\NBSC\Documents\SPORTS EQUIPMENT AND MONITORING SYSTEM"

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env - uncomment MySQL section:
# DATABASE_TYPE=mysql
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
```

#### Step 3: Database Setup
```bash
# Run MySQL migrations
mysql -u root -p < database_setup.sql

# Verify setup
mysql -u root -p -e "SHOW TABLES FROM sports_equipment_system;"
```

#### Step 4: Start Server
```bash
npm start
# Server running on http://localhost:5000
```

### Option B: Supabase (Cloud - Recommended for Production)

#### Step 1: Create Supabase Project (5 minutes)
1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name:** sports-equipment-system
   - **Database Password:** (save this!)
   - **Region:** Choose closest to you
5. Wait 3-5 minutes for creation

#### Step 2: Get Credentials
1. Go to **Settings → API**
2. Copy to `.env`:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = anon public key
   - `SUPABASE_SERVICE_KEY` = service_role key

#### Step 3: Setup Database
```bash
# Copy and configure environment
cp .env.example .env

# Update .env with:
# DATABASE_TYPE=supabase
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_KEY=your_service_key
```

#### Step 4: Run Migrations
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `supabase_migrations.sql`
4. Paste into editor
5. Click **Run**

#### Step 5: Install Dependencies & Start
```bash
npm install

npm start
# Server running on http://localhost:5000
```

### Step 5/6: Test API
```bash
# In another terminal
curl http://localhost:5000/api/equipment
```

---

## MySQL vs Supabase?

| Need | Choose |
|------|--------|
| Learning / Local Dev | **MySQL** |
| Production Ready | **Supabase** |
| Need Real-time | **Supabase** |
| Full Control | **MySQL** |
| No Server Maintenance | **Supabase** |
| Zero Cost | **MySQL** |

👉 **See DATABASE_SELECTION_GUIDE.md for detailed comparison**

---

## 🎯 Core Features Implemented

### ✅ Auto-Calculated Fields

| Field | How It's Calculated | Updates When |
|-------|-------------------|-------------|
| **Quantity Borrowed** | `SUM(active borrow records)` | Equipment borrowed/returned |
| **Quantity Available** | `Total - Quantity Borrowed` | Total changes or borrow changes |
| **Stock Status** | Based on availability % | Quantities change |

### ✅ Real-Time Workflow

```
User Borrows 3 Items
        ↓
✓ Borrow record created
✓ Quantity Borrowed auto-increased
✓ Quantity Available auto-decreased
✓ Stock Status auto-updated
✓ UI immediately reflects changes
```

---

## 📚 Complete API Reference

### Equipment Management

#### 1. Get All Equipment
```bash
curl http://localhost:5000/api/equipment
```

#### 2. Get Equipment by ID
```bash
curl http://localhost:5000/api/equipment/EQ-0001
```

#### 3. Create Equipment
```bash
curl -X POST http://localhost:5000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": "EQ-0009",
    "equipment_name": "Basketball",
    "category_id": "CAT-001",
    "total_quantity": 25,
    "unit_price": 45.99,
    "location": "Storage Room A"
  }'
```

**Result:**
- ✅ Equipment created
- ✅ quantity_borrowed = 0 (no active borrows)
- ✅ quantity_available = 25 (Total - Borrowed)
- ✅ stock_status = "IN_STOCK"

#### 4. Update Equipment
```bash
curl -X PUT http://localhost:5000/api/equipment/EQ-0001 \
  -H "Content-Type: application/json" \
  -d '{"total_quantity": 30}'
```

**Result:**
- ✅ Total quantity updated to 30
- ✅ quantity_available auto-recalculated
- ✅ stock_status auto-updated

#### 5. Delete Equipment
```bash
curl -X DELETE http://localhost:5000/api/equipment/EQ-0001
```

---

### Borrowing Operations

#### 6. Borrow Equipment (AUTO-UPDATES!)
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

**Before:**
- Total: 25
- Borrowed: 8
- Available: 17

**After (AUTO-UPDATED):**
- Total: 25 (unchanged)
- Borrowed: 11 ✅ (8 + 3)
- Available: 14 ✅ (25 - 11)

#### 7. Return Equipment (AUTO-UPDATES!)
```bash
curl -X PUT http://localhost:5000/api/equipment/borrow/BR-0001/return \
  -H "Content-Type: application/json" \
  -d '{
    "condition_at_return": "Good",
    "notes": "Returned in great condition"
  }'
```

**Before:**
- Borrowed: 11
- Available: 14

**After (AUTO-UPDATED):**
- Borrowed: 8 ✅ (back to original)
- Available: 17 ✅ (back to original)

#### 8. Get Active Borrows
```bash
curl http://localhost:5000/api/equipment/borrow/active
```

Shows all unreturned equipment with days_remaining and is_overdue status.

#### 9. Get Borrow History
```bash
curl http://localhost:5000/api/equipment/EQ-0001/borrow-history
```

Shows complete borrowing history for an equipment item.

---

## 🛠️ Development Tips

### Development Mode (Auto-reload)
```bash
npm run dev
# Uses nodemon - server restarts on file changes
```

### View Server Logs
```bash
# When running in dev mode, you'll see:
[2026-06-02T10:00:00.000Z] GET /api/equipment
[2026-06-02T10:00:01.000Z] POST /api/equipment/borrow
```

### Database Queries
```bash
# Connect to MySQL
mysql -u root -p sports_equipment_system

# View equipment
SELECT * FROM equipment;

# View borrow records
SELECT * FROM borrow_records WHERE return_date IS NULL;

# View calculations
SELECT equipment_id, 
       total_quantity,
       (SELECT COUNT(*) FROM borrow_records br WHERE br.equipment_id = e.equipment_id AND return_date IS NULL) as quantity_borrowed
FROM equipment e;
```

---

## ✓ Validation & Error Handling

### Input Validation
```bash
# Invalid equipment ID (has special characters)
curl -X POST http://localhost:5000/api/equipment \
  -d '{"equipment_id":"EQ@001","equipment_name":"Ball","category_id":"CAT-001","total_quantity":10}'

# Response:
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "equipment_id": "Equipment ID must contain only letters, numbers, and hyphens"
  }
}
```

### Over-Borrowing Prevention
```bash
# Try to borrow more than available
curl -X POST http://localhost:5000/api/equipment/borrow \
  -d '{"equipment_id":"EQ-0001","borrowed_by":"USR-001","quantity":100,"due_date":"2026-06-08"}'

# Response:
{
  "success": false,
  "error": "Cannot borrow 100. Only 17 available."
}
```

---

## 📊 Example Data Flow

### Scenario: Basketball Inventory

**Initial State:**
```
Equipment ID: EQ-0001
Equipment Name: Spalding Basketball
Category: Balls
Total Quantity: 25 (Manual entry)
Quantity Borrowed: 0 (Auto-calculated)
Quantity Available: 25 (Auto-calculated)
Status: 🟢 IN STOCK
```

**After John borrows 3:**
```
✓ POST /api/equipment/borrow
  - equipment_id: EQ-0001
  - quantity: 3
  - borrowed_by: USR-003

Result:
Total Quantity: 25 (unchanged)
Quantity Borrowed: 3 ✅ (Auto-calculated)
Quantity Available: 22 ✅ (Auto-calculated)
Status: 🟢 IN STOCK
```

**After Mike borrows 8:**
```
✓ POST /api/equipment/borrow
  - equipment_id: EQ-0001
  - quantity: 8
  - borrowed_by: USR-004

Result:
Total Quantity: 25 (unchanged)
Quantity Borrowed: 11 ✅ (3 + 8)
Quantity Available: 14 ✅ (25 - 11)
Status: 🟢 IN STOCK
```

**After John returns 3:**
```
✓ PUT /api/equipment/borrow/BR-001/return
  - condition_at_return: Good

Result:
Total Quantity: 25 (unchanged)
Quantity Borrowed: 8 ✅ (Auto-recalculated)
Quantity Available: 17 ✅ (Auto-recalculated)
Status: 🟢 IN STOCK
```

---

## 🧪 Testing Checklist

### Basic Operations
- [ ] Create equipment ✅
- [ ] View all equipment ✅
- [ ] View single equipment ✅
- [ ] Update equipment ✅
- [ ] Delete equipment ✅

### Borrowing
- [ ] Borrow equipment ✅
- [ ] Check quantities auto-update ✅
- [ ] View active borrows ✅
- [ ] Return equipment ✅
- [ ] Check quantities auto-recalculate ✅

### Validation
- [ ] Prevent over-borrowing ✅
- [ ] Validate required fields ✅
- [ ] Prevent duplicate equipment IDs ✅
- [ ] Validate dates ✅

### Auto-Calculations
- [ ] Quantity Borrowed sums correctly ✅
- [ ] Quantity Available calculates correctly ✅
- [ ] Status updates appropriately ✅
- [ ] Low stock detected (< 20%) ✅

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:**
- Start MySQL server
- Check DB_HOST, DB_PORT in .env
- Verify credentials

### Cannot POST /api/equipment/borrow
```
Error: Equipment not found
```
**Solution:**
- Verify equipment_id exists
- Use correct equipment_id format

### Port 5000 Already In Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Or use different port: PORT=5001 npm start
```

---

## 📞 Support Resources

| Need | File |
|------|------|
| Complete specification | SYSTEM_PROMPT.md |
| Database details | DATABASE_SCHEMA.md |
| UI/UX flows | UI_WORKFLOWS.md |
| Development guide | IMPLEMENTATION_GUIDE.md |
| Full API reference | API_DOCUMENTATION.md |

---

## 🎉 What's Next?

1. **Build Frontend** - Use React/Vue to consume this API
2. **Add Authentication** - JWT tokens for security
3. **Add Notifications** - Email alerts for low stock
4. **Advanced Features** - QR codes, analytics, reports
5. **Mobile App** - React Native or Flutter

---

**Congratulations!** 🎊  
Your Sports Equipment System is now running with full auto-calculation features!

Start with: `npm start`  
API Documentation: http://localhost:5000/api

Happy coding! ⚽🏀🎾
