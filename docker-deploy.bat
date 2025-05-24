@echo off
echo Docker deployment script for Tanny application

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Stop any running containers
echo Stopping any running containers...
docker-compose down

REM Build the images
echo Building Docker images...
docker-compose build

REM Start the containers
echo Starting containers...
docker-compose up -d

REM Check if containers are running
echo Checking container status...
docker-compose ps

echo.
echo Deployment completed!
echo Frontend should be accessible at: http://192.168.88.96:3000
echo Backend API should be accessible at: http://192.168.88.96:5000
echo.
echo To view logs, use: docker-compose logs
echo To stop the application, use: docker-compose down

pause
