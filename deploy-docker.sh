#!/bin/bash
set -e

echo "========================================="
echo " Manchanda Fabrics - Docker Deployment   "
echo "========================================="

# 1. Stop any old PM2 processes if running
if command -v pm2 &> /dev/null; then
    echo "Stopping PM2 processes to free ports (8092, 3000, 4100)..."
    pm2 stop all || true
fi

# 2. Rebuild and launch containers
echo "Building and launching Docker containers..."
docker compose down || true
docker compose up -d --build

# 3. Show running status
echo "Container Status:"
docker compose ps

echo "========================================="
echo " Deployment Complete!                    "
echo " Backend:  http://127.0.0.1:8092         "
echo " Frontend: http://127.0.0.1:3000         "
echo " Admin:    http://127.0.0.1:4100         "
echo "========================================="
