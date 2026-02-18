#!/bin/bash

# Job Tracker - Quick Start Script
# This script starts both backend and frontend servers

echo "🚀 Starting Job Tracker Application..."
echo ""

# Start Backend
echo "📦 Starting Backend Server (Port 8000)..."
cd /Users/koverthananm/Downloads/JobTracker/personal-ats-backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo "🎨 Starting Frontend Server (Port 3000)..."
cd /Users/koverthananm/Downloads/JobTracker/personel-ats-frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Job Tracker is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Backend API:  http://localhost:8000"
echo "📍 Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
wait
