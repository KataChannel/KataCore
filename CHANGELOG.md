# Changelog - KataCore StartKit v1

## [1.0.0] - 2025-07-03

### 🚀 Major Changes - StartKit v1
- **Remote Deployment**: Deploy to any remote server with SSH access
- **Auto-Environment Generation**: Automatically generate secure environment variables
- **Dual Deployment Modes**: Simple (IP-based) and Full (Domain + SSL)
- **Complete Docker Stack**: API, Site, PostgreSQL, Redis, MinIO, pgAdmin
- **SSL Support**: Automatic Let's Encrypt certificate generation
- **Cleanup Support**: Easy cleanup of remote deployments

### ✨ New Features
- **SSH Key Generation**: Automated SSH key generation with `./ssh-keygen-setup.sh`
- **SSH Config Management**: Automatic SSH config file creation for servers
- **Multiple Key Types**: Support for ED25519 and RSA keys with custom bits
- **Deployment Integration**: Generated keys work seamlessly with deploy-remote.sh
- Remote deployment: `./deploy-remote.sh SERVER_IP DOMAIN`
- Simple deployment: `./deploy-remote.sh --simple SERVER_IP DOMAIN`
- Cleanup deployment: `./deploy-remote.sh --cleanup SERVER_IP`
- Auto-generate secure passwords (16-64 characters)
- Auto-configure Nginx reverse proxy
- Auto-configure SSL certificates with Let's Encrypt
- Health check monitoring for all services
- Docker system optimization and cleanup

### 🔧 Improvements
- Consolidated deployment logic into single script
- Removed redundant helper scripts
- Streamlined configuration process
- Enhanced error handling and logging
- Better deployment status reporting

### 🗑️ Removed (Deprecated in v2)
- `universal-deployer.sh` (replaced by `startkit-deployer.sh`)
- `quick-deploy.sh` and related scripts
- Multiple helper scripts in `scripts/` directory
- Manual environment configuration
- Complex deployment modes

### 📝 Migration Guide from v1 to v2
1. Use new deployment command: `./startkit-deployer.sh --host IP --domain DOMAIN`
2. Remove old `.env.prod` file (will be auto-generated)
3. Update npm scripts to use new deployer
4. SSL now auto-configured (no manual setup needed)

---

## [1.0.0] - Previous Version
- Legacy deployment system
- Manual environment configuration
- Multiple deployment scripts
- Manual SSL setup
