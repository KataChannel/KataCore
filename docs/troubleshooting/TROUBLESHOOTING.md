# 🔧 KataCore Troubleshooting Guide

## Table of Contents
1. [Common Issues](#common-issues)
2. [Deployment Issues](#deployment-issues)
3. [Database Issues](#database-issues)
4. [Authentication Issues](#authentication-issues)
5. [Performance Issues](#performance-issues)
6. [Network Issues](#network-issues)
7. [Docker Issues](#docker-issues)
8. [API Issues](#api-issues)
9. [Monitoring & Diagnostics](#monitoring--diagnostics)
10. [Getting Help](#getting-help)

## Common Issues

### 🚫 Application Won't Start

**Symptoms:**
- Application crashes on startup
- Error messages in logs
- Services not responding

**Troubleshooting Steps:**

1. **Check System Requirements**
   ```bash
   # Verify Node.js version
   node --version  # Should be >= 18.0.0
   
   # Verify npm version
   npm --version   # Should be >= 8.0.0
   
   # Check available memory
   free -h
   
   # Check disk space
   df -h
   ```

2. **Check Environment Variables**
   ```bash
   # Verify required environment variables
   echo $DATABASE_URL
   echo $REDIS_URL
   echo $JWT_SECRET
   echo $NODE_ENV
   ```

3. **Review Application Logs**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Check specific service logs
   docker-compose logs postgres
   docker-compose logs redis
   ```

4. **Verify Port Availability**
   ```bash
   # Check if ports are in use
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :5432
   sudo netstat -tulpn | grep :6379
   ```

**Common Solutions:**
- Install missing dependencies: `npm install`
- Set missing environment variables
- Free up required ports
- Increase system memory

### 🔄 Services Keep Restarting

**Symptoms:**
- Docker containers repeatedly restart
- Services become unavailable intermittently
- High CPU/memory usage

**Troubleshooting Steps:**

1. **Check Container Status**
   ```bash
   # View container status
   docker-compose ps
   
   # Check container resource usage
   docker stats
   
   # View restart count
   docker-compose events
   ```

2. **Analyze Container Logs**
   ```bash
   # View recent logs
   docker-compose logs --tail=100 app
   
   # Follow logs in real-time
   docker-compose logs -f app
   ```

3. **Check System Resources**
   ```bash
   # Check memory usage
   free -h
   
   # Check CPU usage
   top
   
   # Check disk usage
   df -h
   ```

**Common Solutions:**
- Increase memory limits in `docker-compose.yml`
- Fix application code causing crashes
- Optimize database queries
- Scale services horizontally

### 🐌 Slow Performance

**Symptoms:**
- Pages load slowly
- API responses take too long
- Database queries are slow

**Troubleshooting Steps:**

1. **Check Database Performance**
   ```bash
   # Connect to PostgreSQL
   docker-compose exec postgres psql -U postgres -d katacore
   
   # Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   
   # Check database size
   SELECT pg_database_size('katacore');
   ```

2. **Check Redis Performance**
   ```bash
   # Connect to Redis
   docker-compose exec redis redis-cli
   
   # Check memory usage
   INFO memory
   
   # Check connected clients
   CLIENT LIST
   ```

3. **Monitor Application Performance**
   ```bash
   # Check application metrics
   curl http://localhost:3000/api/health
   
   # Check response times
   curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health
   ```

**Common Solutions:**
- Add database indexes
- Implement caching
- Optimize queries
- Increase server resources

## Deployment Issues

### 🚀 Deployment Fails

**Symptoms:**
- Deployment script exits with errors
- Services don't start after deployment
- Configuration errors

**Troubleshooting Steps:**

1. **Check Deployment Logs**
   ```bash
   # View deployment logs
   ./deployment/scripts/deploy-production.sh --verbose
   
   # Check system logs
   journalctl -u katacore
   ```

2. **Verify SSH Connection**
   ```bash
   # Test SSH connection
   ssh -i ~/.ssh/your-key root@your-server
   
   # Check SSH key permissions
   ls -la ~/.ssh/
   chmod 600 ~/.ssh/your-key
   ```

3. **Check Server Resources**
   ```bash
   # Check server capacity
   ssh root@your-server "df -h && free -h && docker --version"
   ```

**Common Solutions:**
- Fix SSH key permissions
- Ensure server meets requirements
- Check network connectivity
- Verify deployment configuration

### 🔐 SSL/TLS Issues

**Symptoms:**
- SSL certificate errors
- HTTPS not working
- Browser security warnings

**Troubleshooting Steps:**

1. **Check Certificate Status**
   ```bash
   # Check certificate validity
   openssl s_client -connect your-domain.com:443 -servername your-domain.com
   
   # Check certificate expiration
   echo | openssl s_client -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
   ```

2. **Verify Domain Configuration**
   ```bash
   # Check DNS records
   dig your-domain.com
   dig www.your-domain.com
   
   # Check domain pointing
   nslookup your-domain.com
   ```

3. **Check Nginx Configuration**
   ```bash
   # Test Nginx configuration
   docker-compose exec nginx nginx -t
   
   # Reload Nginx
   docker-compose exec nginx nginx -s reload
   ```

**Common Solutions:**
- Renew SSL certificates
- Update DNS records
- Fix Nginx configuration
- Use proper certificate chain

## Database Issues

### 🗃️ Database Connection Errors

**Symptoms:**
- "Connection refused" errors
- "Too many connections" errors
- Database timeouts

**Troubleshooting Steps:**

1. **Check Database Status**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check PostgreSQL logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres psql -U postgres -d katacore -c "SELECT 1;"
   ```

2. **Check Connection Configuration**
   ```bash
   # Verify database URL
   echo $DATABASE_URL
   
   # Check connection pool settings
   grep -r "pool" config/
   ```

3. **Monitor Database Connections**
   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity;
   
   -- Check connection limits
   SELECT setting FROM pg_settings WHERE name = 'max_connections';
   
   -- View active queries
   SELECT pid, state, query FROM pg_stat_activity WHERE state = 'active';
   ```

**Common Solutions:**
- Increase connection pool size
- Optimize database queries
- Add connection pooling
- Restart database service

### 🔄 Database Migration Issues

**Symptoms:**
- Migration errors
- Schema inconsistencies
- Data corruption

**Troubleshooting Steps:**

1. **Check Migration Status**
   ```bash
   # Check migration history
   npm run migration:status
   
   # View pending migrations
   npm run migration:pending
   ```

2. **Backup Database Before Migration**
   ```bash
   # Create backup
   docker-compose exec postgres pg_dump -U postgres katacore > backup.sql
   
   # Test migration on backup
   docker-compose exec postgres psql -U postgres -d test_db < backup.sql
   ```

3. **Run Migrations Manually**
   ```bash
   # Run specific migration
   npm run migration:up -- --to 20240115000000
   
   # Rollback migration
   npm run migration:down -- --to 20240115000000
   ```

**Common Solutions:**
- Always backup before migrations
- Test migrations on staging
- Fix migration scripts
- Rollback if necessary

## Authentication Issues

### 🔐 Login Problems

**Symptoms:**
- Users can't log in
- "Invalid credentials" errors
- Session expires immediately

**Troubleshooting Steps:**

1. **Check Authentication Service**
   ```bash
   # Test authentication endpoint
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   
   # Check authentication logs
   docker-compose logs app | grep auth
   ```

2. **Verify JWT Configuration**
   ```bash
   # Check JWT secret
   echo $JWT_SECRET
   
   # Test token generation
   node -e "console.log(require('jsonwebtoken').sign({test:1}, process.env.JWT_SECRET))"
   ```

3. **Check User Database**
   ```sql
   -- Check user exists
   SELECT id, email, status FROM users WHERE email = 'user@example.com';
   
   -- Check password hash
   SELECT password_hash FROM users WHERE email = 'user@example.com';
   ```

**Common Solutions:**
- Reset user password
- Check JWT secret configuration
- Verify user account status
- Clear browser cache/cookies

### 🔑 API Key Issues

**Symptoms:**
- API requests fail with 401 errors
- "Invalid API key" messages
- API key not recognized

**Troubleshooting Steps:**

1. **Verify API Key Format**
   ```bash
   # Check API key format
   echo $API_KEY | head -c 50
   
   # Test API key
   curl -H "X-API-Key: your-api-key" http://localhost:3000/api/health
   ```

2. **Check API Key Database**
   ```sql
   -- Check API key exists
   SELECT id, name, key_hash, status FROM api_keys WHERE key_hash = 'hash';
   
   -- Check API key permissions
   SELECT permissions FROM api_keys WHERE id = 'key_id';
   ```

**Common Solutions:**
- Regenerate API key
- Check API key permissions
- Verify API key format
- Update API key configuration

## Performance Issues

### 🐌 Slow API Responses

**Symptoms:**
- API responses take > 2 seconds
- Timeout errors
- High server load

**Troubleshooting Steps:**

1. **Profile API Performance**
   ```bash
   # Test API response time
   curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/users
   
   # Check application metrics
   curl http://localhost:3000/api/metrics
   ```

2. **Analyze Database Performance**
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   
   -- Check table sizes
   SELECT schemaname, tablename, pg_size_pretty(size) as size
   FROM (SELECT schemaname, tablename, pg_total_relation_size(schemaname||'.'||tablename) as size
         FROM pg_tables WHERE schemaname = 'public') t
   ORDER BY size DESC;
   ```

3. **Monitor System Resources**
   ```bash
   # Check CPU usage
   top -p $(pgrep -f "node")
   
   # Check memory usage
   ps aux | grep node
   
   # Check I/O usage
   iotop -p $(pgrep -f "node")
   ```

**Common Solutions:**
- Add database indexes
- Implement caching
- Optimize queries
- Scale horizontally

### 💾 Memory Issues

**Symptoms:**
- Out of memory errors
- Application crashes
- High memory usage

**Troubleshooting Steps:**

1. **Check Memory Usage**
   ```bash
   # Check system memory
   free -h
   
   # Check process memory
   ps aux --sort=-%mem | head
   
   # Check Node.js memory
   node -e "console.log(process.memoryUsage())"
   ```

2. **Analyze Memory Leaks**
   ```bash
   # Monitor memory over time
   while true; do ps aux | grep node | grep -v grep; sleep 5; done
   
   # Check for memory leaks
   node --inspect app.js
   ```

3. **Check Docker Memory Limits**
   ```bash
   # Check container memory usage
   docker stats
   
   # Check memory limits
   docker-compose exec app cat /sys/fs/cgroup/memory/memory.limit_in_bytes
   ```

**Common Solutions:**
- Increase memory limits
- Fix memory leaks
- Optimize data structures
- Implement garbage collection

## Network Issues

### 🌐 Connection Problems

**Symptoms:**
- Services can't communicate
- Network timeouts
- DNS resolution failures

**Troubleshooting Steps:**

1. **Test Network Connectivity**
   ```bash
   # Test internal connectivity
   docker-compose exec app curl -I http://postgres:5432
   
   # Test external connectivity
   docker-compose exec app curl -I https://google.com
   
   # Check DNS resolution
   docker-compose exec app nslookup google.com
   ```

2. **Check Docker Network**
   ```bash
   # List Docker networks
   docker network ls
   
   # Inspect network configuration
   docker network inspect katacore_default
   
   # Check container network settings
   docker-compose exec app ip addr show
   ```

3. **Test Port Connectivity**
   ```bash
   # Test specific ports
   telnet localhost 3000
   telnet localhost 5432
   telnet localhost 6379
   
   # Check if ports are listening
   netstat -tulpn | grep :3000
   ```

**Common Solutions:**
- Check firewall rules
- Verify Docker network configuration
- Update DNS settings
- Check port forwarding

### 🔥 Firewall Issues

**Symptoms:**
- External connections blocked
- Specific ports not accessible
- Services unreachable

**Troubleshooting Steps:**

1. **Check Firewall Status**
   ```bash
   # Check UFW status
   sudo ufw status
   
   # Check iptables rules
   sudo iptables -L
   
   # Check systemd firewall
   sudo systemctl status firewalld
   ```

2. **Test Port Accessibility**
   ```bash
   # Test from external machine
   telnet your-server-ip 3000
   
   # Test with nmap
   nmap -p 3000 your-server-ip
   ```

3. **Check Service Binding**
   ```bash
   # Check what's listening on ports
   sudo netstat -tulpn | grep :3000
   
   # Check Docker port mapping
   docker-compose ps
   ```

**Common Solutions:**
- Open required ports in firewall
- Check Docker port mapping
- Verify service binding
- Update security groups (cloud)

## Docker Issues

### 🐳 Container Problems

**Symptoms:**
- Containers won't start
- Container exits immediately
- Build failures

**Troubleshooting Steps:**

1. **Check Container Status**
   ```bash
   # View container status
   docker-compose ps
   
   # Check container logs
   docker-compose logs container-name
   
   # Inspect container
   docker-compose exec container-name /bin/bash
   ```

2. **Check Docker Resources**
   ```bash
   # Check Docker system info
   docker system info
   
   # Check available space
   docker system df
   
   # Clean up unused resources
   docker system prune
   ```

3. **Verify Docker Compose**
   ```bash
   # Validate compose file
   docker-compose config
   
   # Check service dependencies
   docker-compose ps --services
   ```

**Common Solutions:**
- Check Dockerfile syntax
- Verify base image availability
- Clean up Docker resources
- Fix volume permissions

### 🔧 Build Issues

**Symptoms:**
- Docker build fails
- Missing dependencies
- Build timeouts

**Troubleshooting Steps:**

1. **Check Build Logs**
   ```bash
   # Build with verbose output
   docker-compose build --no-cache app
   
   # Build specific service
   docker-compose build --progress=plain app
   ```

2. **Verify Dependencies**
   ```bash
   # Check package.json
   cat package.json
   
   # Test dependency installation
   npm install --verbose
   ```

3. **Check Base Image**
   ```bash
   # Pull base image
   docker pull node:18-alpine
   
   # Test base image
   docker run -it node:18-alpine /bin/sh
   ```

**Common Solutions:**
- Update base image
- Fix dependency versions
- Clear Docker cache
- Check network connectivity

## API Issues

### 🔌 API Endpoints Not Working

**Symptoms:**
- 404 errors for API endpoints
- API returns unexpected responses
- CORS errors

**Troubleshooting Steps:**

1. **Test API Endpoints**
   ```bash
   # Test basic connectivity
   curl -I http://localhost:3000/api/health
   
   # Test specific endpoint
   curl -X GET http://localhost:3000/api/users \
     -H "Authorization: Bearer your-token"
   
   # Test with verbose output
   curl -v http://localhost:3000/api/users
   ```

2. **Check API Logs**
   ```bash
   # Check application logs
   docker-compose logs app | grep "GET /api"
   
   # Check error logs
   docker-compose logs app | grep -i error
   ```

3. **Verify API Configuration**
   ```bash
   # Check route configuration
   grep -r "api/users" src/
   
   # Check middleware configuration
   grep -r "cors" src/
   ```

**Common Solutions:**
- Check route definitions
- Verify middleware configuration
- Update CORS settings
- Check API versioning

### 📊 Rate Limiting Issues

**Symptoms:**
- 429 "Too Many Requests" errors
- API calls blocked
- Rate limit exceeded

**Troubleshooting Steps:**

1. **Check Rate Limit Configuration**
   ```bash
   # Check rate limit settings
   grep -r "rateLimit" config/
   
   # Check current limits
   curl -I http://localhost:3000/api/users
   ```

2. **Monitor API Usage**
   ```bash
   # Check API logs for rate limiting
   docker-compose logs app | grep "rate limit"
   
   # Check Redis for rate limit data
   docker-compose exec redis redis-cli keys "*rate*"
   ```

**Common Solutions:**
- Increase rate limits
- Implement different limits for different users
- Add rate limit bypass for specific IPs
- Optimize API usage patterns

## Monitoring & Diagnostics

### 📊 Health Checks

**System Health Check Script:**
```bash
#!/bin/bash
# health-check.sh

echo "=== KataCore Health Check ==="
echo "Timestamp: $(date)"
echo

# Check services
echo "=== Service Status ==="
docker-compose ps

# Check application health
echo "=== Application Health ==="
curl -s http://localhost:3000/api/health | jq '.'

# Check database
echo "=== Database Health ==="
docker-compose exec postgres psql -U postgres -d katacore -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Database: OK"
else
    echo "Database: ERROR"
fi

# Check Redis
echo "=== Redis Health ==="
docker-compose exec redis redis-cli ping

# Check disk space
echo "=== Disk Usage ==="
df -h

# Check memory
echo "=== Memory Usage ==="
free -h

# Check CPU
echo "=== CPU Usage ==="
top -bn1 | grep "Cpu(s)"

echo "=== Health Check Complete ==="
```

### 🔍 Log Analysis

**Log Analysis Script:**
```bash
#!/bin/bash
# analyze-logs.sh

echo "=== KataCore Log Analysis ==="

# Check for errors
echo "=== Recent Errors ==="
docker-compose logs --tail=100 | grep -i error

# Check for warnings
echo "=== Recent Warnings ==="
docker-compose logs --tail=100 | grep -i warn

# Check authentication events
echo "=== Authentication Events ==="
docker-compose logs app | grep -i "auth" | tail -20

# Check database events
echo "=== Database Events ==="
docker-compose logs postgres | tail -20

# Check performance metrics
echo "=== Performance Metrics ==="
docker-compose logs app | grep -i "response time" | tail -10
```

### 📈 Performance Monitoring

**Performance Monitoring Script:**
```bash
#!/bin/bash
# performance-monitor.sh

echo "=== KataCore Performance Monitor ==="

# API Response Time
echo "=== API Response Time ==="
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health

# Database Performance
echo "=== Database Performance ==="
docker-compose exec postgres psql -U postgres -d katacore -c "
SELECT 
    calls,
    mean_time,
    query
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 5;"

# System Resources
echo "=== System Resources ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)"
echo "Memory Usage:"
free -h
echo "Disk I/O:"
iostat -x 1 1

# Container Resources
echo "=== Container Resources ==="
docker stats --no-stream
```

### 📝 Diagnostic Information Collection

**Diagnostic Script:**
```bash
#!/bin/bash
# collect-diagnostics.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DIAG_DIR="diagnostics_$TIMESTAMP"

mkdir -p "$DIAG_DIR"

echo "Collecting diagnostics to $DIAG_DIR..."

# System information
echo "=== System Information ===" > "$DIAG_DIR/system_info.txt"
uname -a >> "$DIAG_DIR/system_info.txt"
lsb_release -a >> "$DIAG_DIR/system_info.txt"
docker --version >> "$DIAG_DIR/system_info.txt"
docker-compose --version >> "$DIAG_DIR/system_info.txt"

# Container status
docker-compose ps > "$DIAG_DIR/container_status.txt"

# Service logs
docker-compose logs app > "$DIAG_DIR/app_logs.txt"
docker-compose logs postgres > "$DIAG_DIR/postgres_logs.txt"
docker-compose logs redis > "$DIAG_DIR/redis_logs.txt"
docker-compose logs nginx > "$DIAG_DIR/nginx_logs.txt"

# Configuration files
cp docker-compose.yml "$DIAG_DIR/"
cp .env "$DIAG_DIR/env_vars.txt"

# System resources
top -bn1 > "$DIAG_DIR/system_resources.txt"
free -h >> "$DIAG_DIR/system_resources.txt"
df -h >> "$DIAG_DIR/system_resources.txt"

# Network information
netstat -tulpn > "$DIAG_DIR/network_info.txt"

# Create archive
tar -czf "diagnostics_$TIMESTAMP.tar.gz" "$DIAG_DIR"
rm -rf "$DIAG_DIR"

echo "Diagnostics collected in diagnostics_$TIMESTAMP.tar.gz"
```

## Getting Help

### 🆘 Emergency Support

**For Critical Issues:**
1. **Immediate Action:**
   - Check system status: `./health-check.sh`
   - Collect diagnostics: `./collect-diagnostics.sh`
   - Check recent changes: `git log --oneline -10`

2. **Contact Support:**
   - Email: emergency@katacore.com
   - Phone: +1-555-KATA-911
   - Slack: #emergency-support

### 📚 Documentation & Resources

**Documentation:**
- [Architecture Guide](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [API Documentation](../api/)
- [Deployment Guide](./DEPLOYMENT-GUIDE.md)

**Community Resources:**
- Discord: https://discord.gg/katacore
- GitHub Issues: https://github.com/katacore/issues
- Stack Overflow: Tag `katacore`

### 🎯 Reporting Issues

**When reporting issues, please include:**

1. **System Information:**
   ```bash
   uname -a
   docker --version
   docker-compose --version
   ```

2. **Error Details:**
   - Error messages
   - Stack traces
   - Relevant logs

3. **Reproduction Steps:**
   - What you were doing
   - Steps to reproduce
   - Expected vs actual behavior

4. **Environment Information:**
   - Operating system
   - Browser (if applicable)
   - Configuration details

**Issue Template:**
```markdown
## Issue Description
Brief description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Ubuntu 22.04]
- Docker Version: [e.g., 24.0.0]
- KataCore Version: [e.g., 1.0.0]

## Additional Context
Any additional information

## Logs
```
relevant logs here
```
```

### 🔧 Self-Help Tools

**Quick Diagnostic Commands:**
```bash
# Quick health check
curl -s http://localhost:3000/api/health | jq '.'

# Check all services
docker-compose ps

# View recent logs
docker-compose logs --tail=50

# Check system resources
free -h && df -h

# Test database connection
docker-compose exec postgres psql -U postgres -d katacore -c "SELECT 1;"

# Test Redis connection
docker-compose exec redis redis-cli ping
```

**Common Fix Commands:**
```bash
# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose down && docker-compose up -d --build

# Clear cache
docker-compose exec redis redis-cli flushall

# Update dependencies
docker-compose exec app npm update

# Reset database (⚠️ DESTRUCTIVE)
docker-compose down -v && docker-compose up -d
```

---

**Remember**: Always backup your data before making significant changes!

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready 🚀
