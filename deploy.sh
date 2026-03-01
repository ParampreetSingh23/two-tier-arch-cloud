#!/bin/bash
set -e  # Exit immediately if any command fails

echo "======================================"
echo "  AttendTrack Deploy Script"
echo "======================================"

# 1. Pull latest code from GitHub
echo ""
echo "[1/4] Pulling latest code..."
git pull origin master

# 2. Stop and remove old containers + images
echo ""
echo "[2/4] Removing old containers and images..."
docker compose down --rmi all --remove-orphans

# 3. Rebuild images from updated Dockerfiles
echo ""
echo "[3/4] Building fresh images..."
docker compose build --no-cache

# 4. Start all services
echo ""
echo "[4/4] Starting services..."
docker compose up -d

echo ""
echo "======================================"
echo "  Deploy complete!"
echo "======================================"

# Show running containers
docker compose ps
