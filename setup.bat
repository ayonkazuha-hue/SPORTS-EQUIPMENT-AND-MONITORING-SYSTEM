#!/bin/bash
# Windows Batch Setup Script - setup.bat
# Run this to set up the Sports Equipment System

@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   SPORTS EQUIPMENT AND MONITORING SYSTEM - Setup           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js is installed

REM Check npm
echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)
echo ✅ npm is installed
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Create .env file
echo ⚙️  Setting up environment configuration...
if not exist .env (
    echo Copying .env.example to .env...
    copy .env.example .env
    echo ✅ Created .env file
    echo.
    echo ⚠️  IMPORTANT: Update .env with your database credentials:
    echo    - DB_HOST: localhost (or your MySQL server)
    echo    - DB_USER: root (or your MySQL user)
    echo    - DB_PASSWORD: (your MySQL password)
    echo    - DB_NAME: sports_equipment_system
    echo.
) else (
    echo ✅ .env file already exists
)

echo.
echo 🗄️  Database Setup Instructions:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. Make sure MySQL Server is running:
echo    - Windows: Services App ^→ Find "MySQL" ^→ Start
echo    - Command: net start MySQL80 (adjust version if needed)
echo.
echo 2. Run the database setup script:
echo    - Option A (Recommended): 
echo      mysql -u root -p ^< database_setup.sql
echo      (then enter your MySQL password)
echo.
echo    - Option B: 
echo      Open MySQL Workbench ^→ File ^→ Open SQL Script
echo      Select database_setup.sql ^→ Execute
echo.
echo 3. Verify setup:
echo    mysql -u root -p -e "SHOW TABLES FROM sports_equipment_system;"
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo ✅ Setup complete!
echo.
echo 🚀 To start the server:
echo    npm start
echo.
echo 📖 After server starts, visit:
echo    http://localhost:5000/api
echo.
echo 📚 For more information:
echo    - QUICK_START.md - Step by step guide
echo    - API_DOCUMENTATION.md - API reference
echo    - README.md - Project overview
echo.

pause
