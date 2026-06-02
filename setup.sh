#!/bin/bash
# setup.sh - Database and Application Setup Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   SPORTS EQUIPMENT SYSTEM - Setup Script                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Step 2: Create .env file
echo "⚙️  Step 2: Checking environment configuration..."
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your database credentials:"
    echo "   - DB_HOST: Your MySQL server host"
    echo "   - DB_USER: Your MySQL user"
    echo "   - DB_PASSWORD: Your MySQL password"
    echo "   - DB_NAME: Database name (default: sports_equipment_system)"
else
    echo "✅ .env file exists"
fi
echo ""

# Step 3: Instructions for database setup
echo "🗄️  Step 3: Database Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 To set up the database, run one of the following:"
echo ""
echo "Option A - Using MySQL CLI:"
echo "   mysql -u root -p < database_setup.sql"
echo ""
echo "Option B - Using MySQL Workbench:"
echo "   1. Open MySQL Workbench"
echo "   2. File → Open SQL Script → Select 'database_setup.sql'"
echo "   3. Execute the script"
echo ""
echo "Option C - Manual setup:"
echo "   1. Open MySQL command line or client"
echo "   2. Copy and paste the contents of database_setup.sql"
echo "   3. Execute all statements"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 4: Start server
echo "🚀 Step 4: Starting the server..."
echo ""
echo "Run one of the following commands:"
echo ""
echo "For production:"
echo "   npm start"
echo ""
echo "For development (with auto-reload):"
echo "   npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ Setup complete! Follow the steps above to:"
echo "   1. Configure your database in .env"
echo "   2. Run the database setup script"
echo "   3. Start the server with 'npm start' or 'npm run dev'"
echo ""
echo "📚 API will be available at: http://localhost:5000"
echo "📖 API Documentation: http://localhost:5000/api"
echo ""
