#!/bin/bash

echo "🌺 Traffic Flower Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed or not in PATH."
    echo "   Please install PostgreSQL and ensure 'psql' is available."
    echo ""
else
    echo "✅ PostgreSQL found: $(psql --version)"
    echo ""
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   Backend dependencies already installed."
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   Frontend dependencies already installed."
fi
cd ..

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
cd server
npm run prisma:generate
cd ..

# Check for .env file
echo ""
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env file not found!"
    echo ""
    echo "Please create server/.env with the following content:"
    echo ""
    echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/traffic_flower?schema=public\""
    echo "JWT_SECRET=\"your-super-secret-jwt-key-change-this-in-production\""
    echo "PORT=5000"
    echo "NODE_ENV=development"
    echo ""
    echo "Replace 'username' and 'password' with your PostgreSQL credentials."
    echo ""
else
    echo "✅ server/.env file exists"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Create PostgreSQL database:"
echo "   psql -U postgres"
echo "   CREATE DATABASE traffic_flower;"
echo "   \\q"
echo ""
echo "2. Update server/.env with your database credentials"
echo ""
echo "3. Run database migrations:"
echo "   cd server && npm run prisma:migrate"
echo ""
echo "4. Start the backend server:"
echo "   cd server && npm run dev"
echo ""
echo "5. In another terminal, start the frontend:"
echo "   cd client && npm run dev"
echo ""
echo "✅ Setup complete! Follow the steps above to finish configuration."
echo ""

