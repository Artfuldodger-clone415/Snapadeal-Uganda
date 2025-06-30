#!/bin/bash

echo "🚀 Starting Snapadeal Platform with SQLite..."
echo "=============================================="

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Attempting to free it..."
        pkill -f ":$1" 2>/dev/null
        sleep 2
    fi
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down Snapadeal Platform..."
    echo "   Stopping Backend..."
    kill $BACKEND_PID 2>/dev/null
    echo "   Stopping Customer App..."
    kill $CUSTOMER_PID 2>/dev/null
    echo "   Stopping Merchant App..."
    kill $MERCHANT_PID 2>/dev/null
    echo "   Stopping Admin App..."
    kill $ADMIN_PID 2>/dev/null
    
    sleep 2
    echo "✅ All applications stopped successfully"
    echo "💾 Database saved as: backend/snapadeal.db"
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup SIGINT SIGTERM

# Check if setup was run
if [ ! -f "backend/go.mod" ]; then
    echo "❌ Backend not set up. Please run ./setup-complete.sh first"
    exit 1
fi

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
check_port 8080
check_port 3000
check_port 3001
check_port 3002

# Start backend
echo ""
echo "📡 Starting Backend Server (SQLite)..."
cd backend
go run main.go &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if backend started successfully
if ! curl -s http://localhost:8080/api/v1/categories >/dev/null 2>&1; then
    echo "❌ Backend failed to start. Check the logs above."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo "✅ Backend started successfully"

# Start Customer App
echo ""
echo "👥 Starting Customer App..."
cd ../customer-app
BROWSER=none npm start &
CUSTOMER_PID=$!

# Start Merchant App
echo "🏪 Starting Merchant App..."
cd ../merchant-app
BROWSER=none PORT=3001 npm start &
MERCHANT_PID=$!

# Start Admin App
echo "⚙️ Starting Admin App..."
cd ../admin-app
BROWSER=none PORT=3002 npm start &
ADMIN_PID=$!

# Wait for all apps to start
echo "⏳ Waiting for all applications to start..."
sleep 10

echo ""
echo "🎉 SNAPADEAL PLATFORM STARTED SUCCESSFULLY!"
echo "=============================================="
echo ""
echo "🌐 Access Your Applications:"
echo "   👥 Customer Portal:  http://localhost:3000"
echo "   🏪 Merchant Portal:  http://localhost:3001"
echo "   ⚙️ Admin Portal:     http://localhost:3002"
echo "   📡 Backend API:      http://localhost:8080"
echo ""
echo "🔐 Default Admin Account:"
echo "   📧 Email:     admin@snapadeal.com"
echo "   🔑 Password:  admin123"
echo ""
echo "💾 Database Information:"
echo "   📁 Type:      SQLite"
echo "   📄 File:      backend/snapadeal.db"
echo "   🔄 Auto-created with sample data"
echo ""
echo "📚 Quick Start Guide:"
echo "   1. Open Admin Portal and login with default account"
echo "   2. Create categories and approve merchant registrations"
echo "   3. Merchants can create deals (pending approval)"
echo "   4. Customers can browse and purchase approved deals"
echo ""
echo "🛑 To stop all applications: Press Ctrl+C"
echo ""

# Keep script running and wait for interrupt
while true; do
    sleep 1
done
