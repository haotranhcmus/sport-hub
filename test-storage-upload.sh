#!/bin/bash

SUPABASE_URL="https://mruygxkhfdbegwgaewwb.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ydXlneGtoZmRiZWd3Z2Fld3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTkzNzYsImV4cCI6MjA4MjMzNTM3Nn0.M2lCEtZbXjBNCT1ngP6tABFADHMejuGbzwapxxnI9_Q"
BUCKET="product-images"
FILE_PATH="test-brands/test-$(date +%s).txt"

echo "=== TEST 1: Upload with ANON key (public role) ==="
echo "Test content" > /tmp/test-upload.txt
curl -X POST "$SUPABASE_URL/storage/v1/object/$BUCKET/$FILE_PATH" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -F "file=@/tmp/test-upload.txt" \
  -v 2>&1 | grep -E "(HTTP|policy|error|success)"

echo -e "\n\n=== TEST 2: Get auth user token from login ==="
echo "Enter admin email (admin@sporthub.vn):"
read EMAIL
echo "Enter password:"
read -s PASSWORD

AUTH_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed!"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

echo "✅ Got access token: ${ACCESS_TOKEN:0:50}..."

echo -e "\n\n=== TEST 3: Upload with AUTHENTICATED token ==="
FILE_PATH_2="test-brands/test-auth-$(date +%s).txt"
curl -X POST "$SUPABASE_URL/storage/v1/object/$BUCKET/$FILE_PATH_2" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $ANON_KEY" \
  -F "file=@/tmp/test-upload.txt" \
  -v 2>&1 | grep -E "(HTTP|policy|error|Key)"

echo -e "\n\n=== TEST 4: List policies ==="
curl -s "$SUPABASE_URL/rest/v1/rpc/get_storage_policies" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"bucket_name":"product-images"}'

rm /tmp/test-upload.txt
