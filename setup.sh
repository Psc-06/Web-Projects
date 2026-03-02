#!/bin/bash

echo "🚀 Setting up Project Zenith..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. You'll need it for the database."
    echo "   Install with: sudo apt install mongodb"
    echo "   Or use MongoDB Atlas (free cloud database): https://www.mongodb.com/cloud/atlas"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys!"
else
    echo "ℹ️  .env file already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your API credentials"
echo "2. Setup PostgreSQL database"
echo "3. Run 'npm run db:push' to create database tables"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📖 Check README.md for detailed setup instructions"
