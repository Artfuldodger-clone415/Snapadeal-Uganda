#!/bin/bash

echo "🎯 Setting up Snapadeal with SQLite..."
echo "================================================"

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "customer-app" ]; then
    echo "❌ Please run this script from the project root directory"
    echo "   Make sure you have: backend/, customer-app/, merchant-app/, admin-app/"
    exit 1
fi

echo "📦 Installing Backend Dependencies..."
cd backend
go mod tidy
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Go dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

echo ""
echo "📦 Installing Customer App Dependencies..."
cd ../customer-app
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Customer App dependencies"
    exit 1
fi
echo "✅ Customer App dependencies installed"

echo ""
echo "📦 Installing Merchant App Dependencies..."
cd ../merchant-app
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Merchant App dependencies"
    exit 1
fi
echo "✅ Merchant App dependencies installed"

echo ""
echo "📦 Installing Admin App Dependencies..."
cd ../admin-app
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Admin App dependencies"
    exit 1
fi
echo "✅ Admin App dependencies installed"

cd ..

echo ""
echo "🎉 Setup Complete!"
echo "================================================"
echo "✅ All dependencies installed"
echo "✅ SQLite will be used as database"
echo "✅ Database file will be created as: backend/snapadeal.db"
echo ""
echo "🚀 Ready to start Snapadeal!"
echo "   Run: ./start-snapadeal.sh"
