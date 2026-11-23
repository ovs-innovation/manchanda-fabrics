#!/bin/bash
set -e

echo "========================================="
echo " Manchanda Fabrics - Full Redeploy       "
echo "========================================="

cd /var/www/manchanda-fabrics

# 1. Pull latest code (force sync with GitHub main)
echo ""
echo "📥 Fetching and syncing latest code from GitHub..."
git fetch origin main
git checkout main 2>/dev/null || true
git reset --hard origin/main
echo "📌 Current commit on server:"
git log -1 --oneline

# 2. Stop old containers (keep volumes!)
echo ""
echo "🛑 Stopping old containers (keeping data volumes)..."
docker compose down --remove-orphans

# 3. Clear old images to force full rebuild
echo ""
echo "🧹 Removing old Docker images to force clean rebuild..."
docker rmi manchanda-fabrics-backend manchanda-fabrics-frontend manchanda-fabrics-admin 2>/dev/null || true

# 4. Rebuild and start fresh with no cache
echo ""
echo "🔨 Building and starting containers (no-cache)..."
docker compose build --no-cache
docker compose up -d --force-recreate

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
