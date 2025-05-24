#!/bin/bash

# Docker deployment script for Tanny application

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop any running containers
echo "Stopping any running containers..."
docker-compose down

# Build the images
echo "Building Docker images..."
docker-compose build

# Start the containers
echo "Starting containers..."
docker-compose up -d

# Check if containers are running
echo "Checking container status..."
docker-compose ps

echo ""
echo "Deployment completed!"
echo "Frontend should be accessible at: http://192.168.88.96:3000"
echo "Backend API should be accessible at: http://192.168.88.96:5000"
echo ""
echo "To view logs, use: docker-compose logs"
echo "To stop the application, use: docker-compose down"
