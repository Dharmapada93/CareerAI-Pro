# CareerAI Pro Ultimate - Concurrent Startup Script
# This script launches the AI service, Express backend, and Vite frontend in separate terminal windows.

Write-Host "Starting CareerAI Pro Ultimate services..." -ForegroundColor Cyan

# 1. Start AI FastAPI Service on port 8000
Write-Host "-> Launching Python AI service on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai-service; .\\.venv\\Scripts\\python main.py" -WindowStyle Normal

# 2. Start Express API Backend on port 5000
Write-Host "-> Launching Express backend on http://127.0.0.1:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# 3. Start Vite React Frontend on port 5173
Write-Host "-> Launching Vite frontend on http://127.0.0.1:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "All services launched successfully!" -ForegroundColor Green
Write-Host "Please ensure local MongoDB (port 27017) and Redis (port 6379) are running in the background." -ForegroundColor Green
