@echo off
REM supabase_setup.bat - Supabase-specific setup script for Windows

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   SUPABASE SETUP FOR SPORTS EQUIPMENT SYSTEM              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ .env created
    echo.
    echo ⚠️  IMPORTANT: Edit .env with your Supabase credentials
    echo    Get them from: https://app.supabase.com ^→ Settings ^→ API
) else (
    echo ✅ .env file exists
)

echo.
echo 🔑 Get Your Supabase Credentials:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. Go to https://app.supabase.com
echo 2. Create a new project (free tier)
echo 3. Wait for project to initialize (3-5 minutes)
echo 4. Go to Settings → API
echo 5. Copy these values to .env:
echo.
echo    SUPABASE_URL = Project URL (https://...)
echo    SUPABASE_ANON_KEY = anon public
echo    SUPABASE_SERVICE_KEY = service_role
echo.
echo 6. Go to Settings → Database
echo    Copy database password to SUPABASE_DB_PASSWORD
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

echo 🗄️  Next Steps:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. Edit .env file with your Supabase credentials
echo    notepad .env
echo.
echo 2. Run database migrations:
echo    - Open: https://app.supabase.com
echo    - Go to SQL Editor
echo    - Create new query
echo    - Copy contents of supabase_migrations.sql
echo    - Paste and click Run
echo.
echo 3. Start the server:
echo    npm start
echo.
echo 4. Test the API:
echo    curl http://localhost:5000/api/equipment
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📚 Documentation:
echo    - SUPABASE_SETUP.md - Complete setup guide
echo    - DATABASE_SELECTION_GUIDE.md - MySQL vs Supabase
echo    - API_DOCUMENTATION.md - API reference
echo.
echo ✅ Supabase setup complete!
echo.
pause
