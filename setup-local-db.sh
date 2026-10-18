#!/bin/bash
set -e

echo "🔧 BEM FKIP UIKA - Setup Local PostgreSQL Database"
echo "=================================================="

# 1. Start PostgreSQL service
echo ""
echo "📦 Step 1: Starting PostgreSQL service..."
brew services start postgresql@16 || brew services restart postgresql@16
sleep 3

# 2. Create database
echo ""
echo "🗄️  Step 2: Creating database 'bem_fkip_dev'..."
/opt/homebrew/opt/postgresql@16/bin/createdb bem_fkip_dev 2>/dev/null || echo "   Database already exists, skipping..."

# 3. Test connection
echo ""
echo "🔌 Step 3: Testing database connection..."
/opt/homebrew/opt/postgresql@16/bin/psql -d bem_fkip_dev -c "SELECT version();" | head -3

# 4. Update .env
echo ""
echo "📝 Step 4: Updating .env file..."
cp .env .env.backup.$(date +%s)
sed -i '' 's|DATABASE_URL=.*|DATABASE_URL="postgresql://postgres@localhost:5432/bem_fkip_dev"|' .env
echo "   ✅ .env updated (backup saved)"

# 5. Push Prisma schema
echo ""
echo "🚀 Step 5: Pushing Prisma schema to database..."
npx prisma db push --accept-data-loss

echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Restart dev server: npm run dev"
echo "2. Seed dummy data: curl -X POST http://localhost:3000/api/internal/seed-dummy -H 'x-seed-key: bem-fkip-seed-2026'"
echo "3. Access admin: http://localhost:3000/admin"
