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

# 2. Build services sequentially to avoid network congestion and ECONNRESET
echo ""
echo "🔨 Building Backend..."
docker compose build backend

echo ""
echo "🔨 Building Admin..."
docker compose build admin

echo ""
echo "🔨 Building Frontend..."
docker compose build frontend

# 3. Start or update containers
echo ""
echo "🚀 Starting fresh containers..."
docker compose up -d --force-recreate

# 4. Ensure Nginx reverse proxy is linked and reloaded
echo ""
echo "🌐 Ensuring Nginx reverse proxy configuration is active..."
if [ -f /etc/nginx/sites-available/manchandafabric.in ]; then
    ln -sf /etc/nginx/sites-available/manchandafabric.in /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx || echo "⚠️ Nginx reload warning"
fi

# 5. Wait a moment for containers to start
echo ""
echo "⏳ Waiting for containers to initialize..."
sleep 5

# 6. Show status
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "🔍 Verifying Admin build inside container:"
docker exec manchanda-admin ls /usr/share/nginx/html/@/assets/ | grep -i sales || true

echo ""
echo "🔍 Verifying Frontend hero video inside container:"
docker exec manchanda-frontend ls -lh /app/public/v1.mp4 || true

echo ""
echo "========================================="
echo " Deployment Complete!                    "
echo " Backend:  https://api.manchandafabric.in"
echo " Frontend: https://manchandafabric.in    "
echo " Admin:    https://admin.manchandafabric.in"
echo "========================================="
