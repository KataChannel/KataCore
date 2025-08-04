#!/bin/bash
echo "=== TazaGroup API Debug ==="

echo "1. Checking Next.js service:"
ssh root@116.118.49.243 "cd /opt/taza_prod && docker compose ps site"

echo "2. Checking port 3900:"
ssh root@116.118.49.243 "netstat -tlnp | grep :3900"

echo "3. Testing internal API:"
ssh root@116.118.49.243 "curl -I http://localhost:3900/api/auth/login"

echo "4. Recent logs:"
ssh root@116.118.49.243 "cd /opt/taza_prod && docker compose logs --tail=10 site"

echo "5. Nginx status:"
ssh root@116.118.49.243 "systemctl is-active nginx"