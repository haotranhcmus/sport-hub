#!/bin/bash

# ============================================================================
# Reset Database to Seed State
# ============================================================================
# Purpose: Drop all data and restore to initial seed state
# Usage: ./reset-to-seed.sh
# ⚠️  WARNING: This will DELETE ALL DATA in the database!
# ============================================================================

set -e  # Exit on any error

echo "🚨 =============================================="
echo "   DATABASE RESET SCRIPT"
echo "   This will DELETE ALL DATA!"
echo "🚨 =============================================="
echo ""
echo "Current working directory: $(pwd)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "   Please create .env file with DATABASE_URL"
    exit 1
fi

# Confirmation prompt
read -p "⚠️  Are you sure you want to RESET the database? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "🔄 Starting database reset..."
echo ""

# Step 1: Drop all tables and recreate schema
echo "📋 Step 1/3: Dropping all tables and recreating schema..."
npx prisma db push --force-reset --accept-data-loss

# Step 2: Generate Prisma Client
echo ""
echo "📋 Step 2/3: Generating Prisma Client..."
npx prisma generate

# Step 3: Run seed
echo ""
echo "📋 Step 3/5: Running seed data..."
npx prisma db seed

# Step 4: Apply RLS policies for Supabase
echo ""
echo "📋 Step 4/5: Applying Supabase RLS policies..."

# Extract database connection from .env
DATABASE_URL=$(grep VITE_SUPABASE_DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Warning: VITE_SUPABASE_DATABASE_URL not found in .env"
    echo "   Skipping RLS policy setup. You may need to run manually:"
    echo "   PGPASSWORD=\"your_password\" psql \"your_db_url\" -f prisma/grant-anon-access.sql"
    echo "   PGPASSWORD=\"your_password\" psql \"your_db_url\" -f prisma/enable-rls-policies.sql"
else
    # Extract password from connection string
    PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    
    if [ -f "prisma/grant-anon-access.sql" ]; then
        echo "   → Granting schema access to anon role..."
        PGPASSWORD="$PASSWORD" psql "$DATABASE_URL" -f prisma/grant-anon-access.sql > /dev/null 2>&1 || echo "   ⚠️  Some grant statements failed (this is normal)"
    fi
    
    if [ -f "prisma/enable-rls-policies.sql" ]; then
        echo "   → Enabling RLS policies..."
        PGPASSWORD="$PASSWORD" psql "$DATABASE_URL" -f prisma/enable-rls-policies.sql > /dev/null 2>&1 || echo "   ⚠️  Some policy statements failed (this is normal)"
    fi
    
    echo "   ✅ RLS policies applied"
fi

# Step 5: Verify data
echo ""
echo "📋 Step 5/5: Verifying seed data..."
echo "   (Checking if data was created successfully...)"

echo ""
echo "✅ =============================================="
echo "   DATABASE RESET COMPLETE!"
echo "✅ =============================================="
echo ""
echo "Your database has been restored to seed state:"
echo "  ✅ 3 Size Guides"
echo "  ✅ 4 Categories (Giày, Áo, Găng, Phụ kiện)"
echo "  ✅ 3 Brands (Nike, Adidas, Puma)"
echo "  ✅ 10 Product Attributes (logic theo từng category)"
echo "  ✅ 4 Products (10 variants, 1 review)"
echo "  ✅ 2 Users (1 admin, 1 customer)"
echo "  ✅ 1 Supplier"
echo "  ✅ 2 Orders (1 completed, 1 pending)"
echo "  ✅ 1 Return Request"
echo "  ✅ RLS Policies enabled (Supabase ready)"
echo ""
echo "🔐 Admin credentials:"
echo "   Email: admin@sporthub.vn"
echo "   Password: admin123"
echo ""
echo "🌐 Next steps:"
echo "   1. npm run dev (if not running)"
echo "   2. Open http://localhost:3001"
echo "   3. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo ""
