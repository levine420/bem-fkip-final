#!/bin/bash
set -e

echo "🚀 BEM FKIP UIKA - Final Setup"
echo "=============================="

# 1. Kill existing dev server
echo "1. Stopping existing dev server..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "   No dev server running"
sleep 2

# 2. Start new dev server in background
echo "2. Starting dev server..."
cd /Users/macbookair/Desktop/bem-fkip-final
npm run dev > /tmp/bem-dev-server.log 2>&1 &
DEV_PID=$!
echo "   Dev server PID: $DEV_PID"

# 3. Wait for dev server ready
echo "3. Waiting for dev server to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:3000/api/admin/auth/csrf > /dev/null 2>&1; then
    echo "   ✅ Dev server ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "   ❌ Timeout waiting for dev server"
    exit 1
  fi
  sleep 1
done

# 4. Seed dummy data
echo "4. Seeding 5 berita + 5 kegiatan..."
SEED_RESULT=$(curl -s -X POST http://localhost:3000/api/internal/seed-dummy \
  -H "x-seed-key: bem-fkip-seed-2026" \
  -H "Content-Type: application/json")

echo "$SEED_RESULT" | jq -r '.log // .error' 2>/dev/null || echo "$SEED_RESULT"

echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "📰 Berita: http://localhost:3000/berita"
echo "📅 Kegiatan: http://localhost:3000/kegiatan"
echo "🔧 Admin: http://localhost:3000/admin"
