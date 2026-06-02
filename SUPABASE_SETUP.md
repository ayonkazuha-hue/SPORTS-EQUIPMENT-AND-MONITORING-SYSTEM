# Supabase Setup & Integration Guide
## Sports Equipment and Monitoring System

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Supabase Project Setup](#supabase-project-setup)
4. [Database Migration](#database-migration)
5. [Environment Configuration](#environment-configuration)
6. [Authentication Setup](#authentication-setup)
7. [API Integration](#api-integration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This guide explains how to set up **Supabase** as your primary database for the Sports Equipment System. Supabase provides:

- ✅ PostgreSQL database (secure, scalable)
- ✅ Built-in authentication (JWT-based)
- ✅ Real-time subscriptions
- ✅ Edge functions (serverless)
- ✅ Row-level security (RLS)
- ✅ Automatic backups
- ✅ Free tier available

### Why Supabase?

| Feature | Benefit |
|---------|---------|
| PostgreSQL | More powerful than MySQL for JSON, arrays, full-text search |
| Authentication | Built-in user management and JWT tokens |
| Real-time | Live updates without polling |
| Security | Row-level security policies |
| Scalability | Managed infrastructure |
| Serverless | No server maintenance needed |

---

## Prerequisites

- Supabase account (free at https://supabase.com)
- Node.js v14+
- Your Sports Equipment System code

---

## Supabase Project Setup

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with email or GitHub
4. Verify your email

### Step 2: Create New Project

1. Click **"New Project"**
2. Fill in:
   - **Project name:** sports-equipment-system
   - **Database password:** Use strong password (save it!)
   - **Region:** Choose closest to you
   - **Pricing plan:** Free tier is fine for testing
3. Click **"Create new project"**
4. Wait 3-5 minutes for project creation

### Step 3: Get Your Credentials

Once project is created:

1. Go to **Settings → API** in the left sidebar
2. Copy these values to your `.env` file:
   - **Project URL** → `SUPABASE_URL`
   - **anon key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY`

Example:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Get Database Password

1. Go to **Settings → Database**
2. Under **Database Password**, click **"Reveal"**
3. Copy to `.env` as `SUPABASE_DB_PASSWORD`

---

## Database Migration

### Step 1: Navigate to SQL Editor

1. In Supabase dashboard
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"**

### Step 2: Copy SQL Script

1. Open `supabase_migrations.sql` from your project
2. Copy **entire contents**
3. Paste into Supabase SQL Editor

### Step 3: Execute Migration

1. Click **"Run"** button (or Ctrl+Enter)
2. Wait for queries to complete
3. You should see "Queries executed successfully"

### Step 4: Verify Tables

1. Click **"Table Editor"** in left sidebar
2. You should see:
   - categories
   - users
   - equipment
   - borrow_records
   - audit_log

---

## Environment Configuration

### Update .env File

```bash
# Copy template
cp .env.example .env

# Edit .env with your values
```

### Required Configuration

```env
# Supabase Settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_DB_PASSWORD=your_postgres_password

# Database Type
DATABASE_TYPE=supabase

# Authentication
SUPABASE_AUTH_ENABLED=true
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
```

### Generate JWT Secret

```bash
# On Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid)) | % {$_[0..31] -join ''}

# On Mac/Linux:
openssl rand -base64 32
```

---

## Authentication Setup

### Step 1: Enable Auth in Supabase

1. Go to **Authentication** in sidebar
2. Click **"Providers"**
3. Ensure **"Email"** provider is enabled
4. Configure:
   - Allow sign ups: ✅ Yes
   - Auto confirm users: ⚠️ Only for testing
   - Confirm email: ✅ Yes (for production)

### Step 2: Create Auth Users

In Supabase dashboard:

1. **Authentication → Users**
2. Click **"Invite"**
3. Add email addresses of team members
4. They'll receive invitation emails

Or programmatically via API (see API Integration below)

### Step 3: Link Auth to Equipment Users

The system automatically syncs Supabase Auth users with the `users` table.

---

## API Integration

### Install Supabase Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-express jsonwebtoken
```

### Start Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Verify Connection

Check server logs:
```
✅ Database: Supabase (PostgreSQL)
✅ Supabase connected successfully
```

---

## Testing

### Test 1: Get All Equipment

```bash
curl http://localhost:5000/api/equipment
```

**Expected Response:**
```json
{
    "success": true,
    "data": [
        {
            "equipment_id": "EQ-0001",
            "equipment_name": "Spalding Basketball",
            "category_name": "Balls",
            "total_quantity": 25,
            "quantity_borrowed": 8,
            "quantity_available": 17,
            "stock_status": "IN_STOCK"
        }
    ]
}
```

### Test 2: Create Equipment

```bash
curl -X POST http://localhost:5000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": "EQ-TEST-001",
    "equipment_name": "Test Racket",
    "category_id": "CAT-002",
    "total_quantity": 10,
    "unit_price": 99.99
  }'
```

### Test 3: Borrow Equipment (Auto-Updates)

```bash
curl -X POST http://localhost:5000/api/equipment/borrow \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": "EQ-0001",
    "borrowed_by": "USR-001",
    "quantity": 5,
    "due_date": "2026-06-10"
  }'
```

**Expected:** quantity_borrowed and quantity_available auto-update!

### Test 4: Check Supabase Tables

In Supabase Table Editor:
1. Click **equipment** table
2. Verify new records appear
3. Check **borrow_records** for new borrows

---

## Troubleshooting

### Error: "Missing Supabase configuration"

**Solution:** Check your `.env` file:
```env
SUPABASE_URL=https://your-project.supabase.co  # Must start with https://
SUPABASE_ANON_KEY=eyJ...                        # Long JWT token
SUPABASE_SERVICE_KEY=eyJ...                     # Different long JWT token
```

### Error: "Supabase connection failed"

**Solution:**
1. Verify project is created and running
2. Check SUPABASE_URL is correct
3. Verify project hasn't been paused
4. Check network connectivity

### Error: "Tables not found"

**Solution:**
1. Run `supabase_migrations.sql` in SQL Editor
2. Wait for queries to complete
3. Refresh browser
4. Check Table Editor again

### Slow Queries

**Solution:**
1. Supabase free tier may have limited resources
2. Upgrade to Pro tier if needed
3. Add more indexes for common queries

### CORS Errors from Frontend

**Solution:** Update CORS settings in Supabase:
1. **Settings → API**
2. Add your frontend URL to allowed origins
3. Example: `http://localhost:3000`

---

## Production Deployment

### Step 1: Upgrade Plan

1. Go to **Billing**
2. Upgrade to **Pro** tier ($25/month)
3. Provides more resources and uptime SLA

### Step 2: Enable RLS (Row Level Security)

1. **Table Editor** → select `equipment`
2. **Security → Enable RLS**
3. Add policies for your roles:

```sql
-- Policy: Users can view equipment
CREATE POLICY "Users can view equipment"
ON equipment
FOR SELECT
USING (is_active = true);

-- Policy: Managers can update equipment
CREATE POLICY "Managers can update equipment"
ON equipment
FOR UPDATE
USING (auth.jwt() ->> 'role' = 'Manager');
```

### Step 3: Set Up Backups

1. **Settings → Backups**
2. Ensure daily automated backups enabled
3. Test restore process

### Step 4: Configure Custom Domain

1. **Settings → Custom Domain**
2. Add your domain (optional)

### Step 5: Set Environment Variables

```env
NODE_ENV=production
DATABASE_TYPE=supabase
SUPABASE_AUTH_ENABLED=true
# Add other production settings...
```

---

## Comparison: MySQL vs Supabase

| Feature | MySQL | Supabase |
|---------|-------|----------|
| Cost | Free (self-hosted) | Free tier + $25/mo Pro |
| Setup | Manual | 5 minutes |
| Authentication | Manual | Built-in |
| Real-time | No | Yes ✅ |
| Backups | Manual | Automatic ✅ |
| Scaling | Complex | Automatic ✅ |
| Security | Manual | Built-in RLS ✅ |
| Maintenance | Required | Managed ✅ |
| Learning Curve | Easy | Easy |

---

## Useful Supabase Resources

- **Dashboard:** https://app.supabase.com
- **Documentation:** https://supabase.com/docs
- **API Docs:** https://supabase.com/docs/guides/api
- **Community:** https://discord.supabase.io
- **Status Page:** https://status.supabase.com

---

## Switching Back to MySQL

If you need to use MySQL instead:

1. Update `.env`:
   ```env
   DATABASE_TYPE=mysql
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   ```

2. Run MySQL setup:
   ```bash
   mysql -u root -p < database_setup.sql
   ```

3. Restart server:
   ```bash
   npm start
   ```

---

## Next Steps

1. ✅ Create Supabase account and project
2. ✅ Run database migrations
3. ✅ Configure `.env` file
4. ✅ Start API server
5. ✅ Test endpoints
6. ✅ Build frontend to consume API
7. ✅ Set up authentication
8. ✅ Deploy to production

---

**Questions?** Check API_DOCUMENTATION.md for endpoint details.

**Ready to build?** See QUICK_START.md for immediate next steps.
