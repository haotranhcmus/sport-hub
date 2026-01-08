#!/bin/bash

# Quick check seed data via Supabase REST API

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ydXlneGtoZmRiZWd3Z2Fld3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTkzNzYsImV4cCI6MjA4MjMzNTM3Nn0.M2lCEtZbXjBNCT1ngP6tABFADHMejuGbzwapxxnI9_Q"
BASE_URL="https://mruygxkhfdbegwgaewwb.supabase.co/rest/v1"

echo "🔍 Checking Seed Data..."
echo ""

echo "👥 Users:"
curl -s -H "apikey: $API_KEY" "$BASE_URL/User?select=email,role" | jq -r '.[] | "  - \(.email) (\(.role))"'

echo ""
echo "📁 Categories:"
curl -s -H "apikey: $API_KEY" "$BASE_URL/Category?select=name" | jq -r '.[] | "  - \(.name)"'

echo ""
echo "🏷️  Brands:"
curl -s -H "apikey: $API_KEY" "$BASE_URL/Brand?select=name,country" | jq -r '.[] | "  - \(.name) (\(.country))"'

echo ""
echo "🎨 Attributes:"
curl -s -H "apikey: $API_KEY" "$BASE_URL/ProductAttribute?select=name,type" | jq -r '.[] | "  - \(.name) [\(.type)]"'

echo ""
echo "📏 Size Guides:"
curl -s -H "apikey: $API_KEY" "$BASE_URL/SizeGuide?select=name" | jq -r '.[] | "  - \(.name)"'

echo ""
echo "🏭 Suppliers:"
curl -s -H "apikey: $API_KEY" "$BASE_URL/Supplier?select=name" | jq -r '.[] | "  - \(.name)"'

echo ""
echo "✅ Check complete!"
