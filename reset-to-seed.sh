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

# Step 1: Reset migrations
echo "📋 Step 1/4: Resetting migrations..."
npx prisma migrate reset --force --skip-seed

# Step 2: Push schema
echo ""
echo "📋 Step 2/4: Pushing schema..."
npx prisma db push --force-reset

# Step 3: Generate Prisma Client
echo ""
echo "📋 Step 3/4: Generating Prisma Client..."
npx prisma generate

# Step 4: Run seed
echo ""
echo "📋 Step 4/4: Running seed data..."
npx prisma db seed

echo ""
echo "✅ =============================================="
echo "   DATABASE RESET COMPLETE!"
echo "✅ =============================================="
echo ""
echo "Your database has been restored to seed state:"
echo "  ✓ Size Guides: 2"
echo "  ✓ Categories: 3"
echo "  ✓ Brands: 3"
echo "  ✓ Attributes: 6"
echo "  ✓ Suppliers: 1"
echo "  ✓ Products: 5"
echo "  ✓ Users: 4 (including admin)"
echo ""
echo "🔐 Admin credentials:"
echo "   Email: admin@sporthub.vn"
echo "   Password: admin123"
echo ""
