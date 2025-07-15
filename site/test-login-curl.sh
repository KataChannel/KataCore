#!/bin/bash

# Quick test to login and get a token we can test with
echo "Testing login to get token..."

curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@tazacore.com",
    "password": "SuperAdmin@2024",
    "provider": "email"
  }' \
  -c cookies.txt \
  -v

echo ""
echo "Cookies saved to cookies.txt"
echo "Checking token..."

if [ -f cookies.txt ]; then
  cat cookies.txt
fi
