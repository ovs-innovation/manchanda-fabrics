#!/bin/bash
set -e

echo "========================================="
echo " Manchanda Fabrics - Full Redeploy       "
echo "========================================="

cd /var/www/manchanda-fabrics

# 1. Pull latest code
echo ""
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Stop old containers (keep volumes!)
echo ""
echo "🛑 Stopping old containers (keeping data volumes)..."
docker compose down --remove-orphans

# 3. Clear old images to force full rebuild
echo ""
echo "🧹 Removing old Docker images to force clean rebuild..."
docker rmi manchanda-fabrics-backend manchanda-fabrics-frontend manchanda-fabrics-admin 2>/dev/null || true

# 4. Rebuild and start fresh
echo ""
echo "🔨 Building and starting containers..."
docker compose up -d --build --force-recreate

# 5. Wait a moment for containers to start
echo ""
echo "⏳ Waiting for containers to start..."
sleep 10

# 6. Show status
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "📜 Recent backend logs:"
docker logs manchanda-backend --tail=20

echo ""
echo "========================================="
echo " Deployment Complete!                    "
echo " Backend:  https://api.manchandafabric.in"
echo " Frontend: https://manchandafabric.in    "
echo " Admin:    https://admin.manchandafabric.in"
echo "========================================="
