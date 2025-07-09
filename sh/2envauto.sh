#!/bin/bash

# 🔐 Tazav1 Auto-Generated Security Script
# Tạo các mật khẩu và secrets bảo mật tự động

set -euo pipefail

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'

# Unicode symbols
readonly CHECK="✅"
readonly CROSS="❌"
readonly INFO="ℹ️"
readonly WARNING="⚠️"
readonly ROCKET="🚀"
readonly LOCK="🔐"
readonly FOLDER="📁"
readonly SHIELD="🛡️"

# Default options
CREATE_ENV=false
PROJECT_NAME="tazav1"
SHOW_HELP=false

# Default ports
SITE_PORT=3000
API_PORT=3001
POSTGRES_PORT=5432
REDIS_PORT=6379
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
PGADMIN_PORT=5050

# Logging functions
log() { echo -e "${CYAN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}${INFO} $1${NC}"; }
success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
error() { echo -e "${RED}${CROSS} $1${NC}"; exit 1; }

# Validate port number
validate_port() {
    local port=$1
    if [[ ! "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
        return 1
    fi
    return 0
}

# Get port input from user
get_port_input() {
    local port_name=$1
    local default_port=$2
    local user_port
    
    while true; do
        read -p "Nhập ${port_name} [${default_port}]: " user_port
        user_port=${user_port:-$default_port}
        
        if validate_port "$user_port"; then
            echo "$user_port"
            break
        else
            warning "Port không hợp lệ. Vui lòng nhập số từ 1-65535"
        fi
    done
}

# Detect project name automatically
detect_project_name() {
    local project_name=""
    
    # Try package.json
    if [[ -f "package.json" ]]; then
        project_name=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' package.json | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null)
    fi
    
    # Try composer.json
    if [[ -z "$project_name" && -f "composer.json" ]]; then
        project_name=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' composer.json | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' | cut -d'/' -f2 2>/dev/null)
    fi
    
    # Try directory name
    if [[ -z "$project_name" ]]; then
        project_name=$(basename "$(pwd)")
    fi
    
    # Clean project name (remove special chars, convert to lowercase)
    project_name=$(echo "$project_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
    
    # Fallback to tazav1 if empty
    if [[ -z "$project_name" ]]; then
        project_name="tazav1"
    fi
    
    echo "$project_name"
}

# Get project configuration from user
get_project_config() {
    local detected_name=$(detect_project_name)
    
    echo
    echo -e "${BLUE}${FOLDER} Cấu hình dự án${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    
    # Get project name
    echo -e "${YELLOW}Tên dự án được phát hiện:${NC} ${GREEN}$detected_name${NC}"
    echo
    read -p "Nhập tên dự án [${detected_name}]: " user_project_name
    PROJECT_NAME=${user_project_name:-$detected_name}
    
    # Validate and clean project name
    PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
    if [[ -z "$PROJECT_NAME" ]]; then
        PROJECT_NAME="tazav1"
    fi
    
    success "Sử dụng tên dự án: ${GREEN}$PROJECT_NAME${NC}"
    
    echo
    echo -e "${BLUE}${SHIELD} Cấu hình ports${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    
    # Get all ports
    SITE_PORT=$(get_port_input "SITE_PORT" "$SITE_PORT")
    API_PORT=$(get_port_input "API_PORT" "$API_PORT")
    POSTGRES_PORT=$(get_port_input "POSTGRES_PORT" "$POSTGRES_PORT")
    REDIS_PORT=$(get_port_input "REDIS_PORT" "$REDIS_PORT")
    MINIO_PORT=$(get_port_input "MINIO_PORT" "$MINIO_PORT")
    MINIO_CONSOLE_PORT=$(get_port_input "MINIO_CONSOLE_PORT" "$MINIO_CONSOLE_PORT")
    PGADMIN_PORT=$(get_port_input "PGADMIN_PORT" "$PGADMIN_PORT")
    
    echo
    success "Cấu hình ports hoàn tất"
}

# Show help
show_help() {
    echo -e "${BLUE}Sử dụng: $0 [OPTIONS]${NC}"
    echo
    echo -e "${YELLOW}Tùy chọn:${NC}"
    echo -e "  ${GREEN}--env${NC}             Tạo file .env.prod"
    echo -e "  ${GREEN}--project <name>${NC}  Đặt tên dự án"
    echo -e "  ${GREEN}--site-port <port>${NC}     Đặt SITE_PORT (default: 3000)"
    echo -e "  ${GREEN}--api-port <port>${NC}      Đặt API_PORT (default: 3001)"
    echo -e "  ${GREEN}--postgres-port <port>${NC} Đặt POSTGRES_PORT (default: 5432)"
    echo -e "  ${GREEN}--redis-port <port>${NC}    Đặt REDIS_PORT (default: 6379)"
    echo -e "  ${GREEN}--minio-port <port>${NC}    Đặt MINIO_PORT (default: 9000)"
    echo -e "  ${GREEN}--minio-console-port <port>${NC} Đặt MINIO_CONSOLE_PORT (default: 9001)"
    echo -e "  ${GREEN}--pgadmin-port <port>${NC}  Đặt PGADMIN_PORT (default: 8080)"
    echo -e "  ${GREEN}--help${NC}            Hiển thị trợ giúp này"
    echo
    echo -e "${YELLOW}Ví dụ:${NC}"
    echo -e "  $0                          # Tạo .env.prod (interactive)"
    echo -e "  $0 --env                    # Tạo .env.prod"
    echo -e "  $0 --env --project myapp    # Tạo .env.prod với tên dự án"
    echo -e "  $0 --env --site-port 3005   # Tạo .env.prod với SITE_PORT tùy chỉnh"
    echo
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                CREATE_ENV=true
                shift
                ;;
            --project)
                if [[ -n "${2:-}" ]]; then
                    PROJECT_NAME=$(echo "$2" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
                    shift 2
                else
                    error "Tên dự án không được để trống"
                fi
                ;;
            --site-port)
                if [[ -n "${2:-}" ]] && validate_port "$2"; then
                    SITE_PORT="$2"
                    shift 2
                else
                    error "Port không hợp lệ cho --site-port"
                fi
                ;;
            --api-port)
                if [[ -n "${2:-}" ]] && validate_port "$2"; then
                    API_PORT="$2"
                    shift 2
                else
                    error "Port không hợp lệ cho --api-port"
                fi
                ;;
            --postgres-port)
                if [[ -n "${2:-}" ]] && validate_port "$2"; then
                    POSTGRES_PORT="$2"
                    shift 2
                else
                    error "Port không hợp lệ cho --postgres-port"
                fi
                ;;
            --redis-port)
                if [[ -n "${2:-}" ]] && validate_port "$2"; then
                    REDIS_PORT="$2"
                    shift 2
                else
                    error "Port không hợp lệ cho --redis-port"
                fi
                ;;
            --minio-port)
                if [[ -n "${2:-}" ]] && validate_port "$2"; then
                    MINIO_PORT="$2"
                    shift 2
                else
                    error "Port không hợp lệ cho --minio-port"
                fi
                ;;
            --minio-console-port)
                if [[ -n "${2:-}" ]] && validate_port "$2"; then
                    MINIO_CONSOLE_PORT="$2"
                    shift 2
                else
                    error "Port không hợp lệ cho --minio-console-port"
                fi
                ;;
            --pgadmin-port)
                if [[ -n "${2:-}" ]] && validate_port "$2"; then
                    PGADMIN_PORT="$2"
                    shift 2
                else
                    error "Port không hợp lệ cho --pgadmin-port"
                fi
                ;;
            --help|-h)
                SHOW_HELP=true
                shift
                ;;
            *)
                warning "Tùy chọn không hợp lệ: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # If no options provided, default to creating env file
    if [[ "$CREATE_ENV" == false && "$SHOW_HELP" == false ]]; then
        CREATE_ENV=true
    fi
}

# Generate secure password
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $((length * 3 / 4)) | tr -d "=+/\n" | cut -c1-$length
}

# Generate JWT secret
generate_jwt_secret() {
    openssl rand -base64 64 | tr -d "\n"
}

# Create .env.prod file
create_env_file() {
    log "Tạo file .env.prod..."
    
    # Generate all passwords
    local DB_PASSWORD=$(generate_password 8)
    local REDIS_PASSWORD=$(generate_password 8)
    local JWT_SECRET=$(generate_jwt_secret)
    local ENCRYPTION_KEY=$(generate_password 8)
    local MINIO_ROOT_PASSWORD=$(generate_password 8)
    local MINIO_ACCESS_KEY=$(generate_password 8)
    local PGADMIN_PASSWORD=$(generate_password 8)
    local GRAFANA_PASSWORD=$(generate_password 8)
    
    # Create .env.prod file
    cat > .env.prod << EOF
# 🔐 ${PROJECT_NAME^^} Auto-Generated Security Configuration
# Generated on: $(date '+%Y-%m-%d %H:%M:%S %Z')
# Project: $PROJECT_NAME
# ===== DATABASE =====
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=$PROJECT_NAME
POSTGRES_USER=$PROJECT_NAME
DATABASE_URL=postgresql://$PROJECT_NAME:$DB_PASSWORD@localhost:$POSTGRES_PORT/$PROJECT_NAME

# ===== REDIS =====
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=redis://:$REDIS_PASSWORD@localhost:$REDIS_PORT/0

# ===== MINIO =====
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD
MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
MINIO_SECRET_KEY=$MINIO_ROOT_PASSWORD
MINIO_ENDPOINT=http://localhost:$MINIO_PORT

# ===== SECURITY =====
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# ===== ADMIN TOOLS =====
PGADMIN_DEFAULT_EMAIL=admin.$PROJECT_NAME@gmail.com
PGADMIN_DEFAULT_PASSWORD=$PGADMIN_PASSWORD
GRAFANA_ADMIN_PASSWORD=$GRAFANA_PASSWORD

# ===== APP CONFIG =====
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:$API_PORT

# ===== PORTS =====
SITE_PORT=$SITE_PORT
API_PORT=$API_PORT
POSTGRES_PORT=$POSTGRES_PORT
REDIS_PORT=$REDIS_PORT
MINIO_PORT=$MINIO_PORT
MINIO_CONSOLE_PORT=$MINIO_CONSOLE_PORT
PGADMIN_PORT=$PGADMIN_PORT

# ===== ADDITIONAL CONFIG =====
API_VERSION=latest
SITE_VERSION=latest
RESTART_POLICY=unless-stopped
CORS_ORIGIN=http://localhost:$SITE_PORT
LOG_LEVEL=info
NEXT_PUBLIC_APP_URL=http://localhost:$SITE_PORT
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:$MINIO_PORT
INTERNAL_API_URL=http://api:$API_PORT
MINIO_USE_SSL=false
EOF

    # Add to .gitignore if exists
    if [[ -f .gitignore ]] && ! grep -q ".env.prod" .gitignore; then
        echo ".env.prod" >> .gitignore
    fi
    
    success ".env.prod đã tạo ($(wc -l < .env.prod) dòng)"
}

# Show final results
show_results() {
    echo
    echo -e "${GREEN}${CHECK} ═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}${CHECK} HOÀN TẤT TẠO CẤU HÌNH ${PROJECT_NAME^^}${NC}"
    echo -e "${GREEN}${CHECK} ═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo
    
    echo -e "${BLUE}${FOLDER} File .env.prod:${NC} Đã tạo"
    echo -e "${BLUE}${SHIELD} Ports được cấu hình:${NC}"
    echo -e "  ${YELLOW}•${NC} SITE_PORT: $SITE_PORT"
    echo -e "  ${YELLOW}•${NC} API_PORT: $API_PORT"
    echo -e "  ${YELLOW}•${NC} POSTGRES_PORT: $POSTGRES_PORT"
    echo -e "  ${YELLOW}•${NC} REDIS_PORT: $REDIS_PORT"
    echo -e "  ${YELLOW}•${NC} MINIO_PORT: $MINIO_PORT"
    echo -e "  ${YELLOW}•${NC} MINIO_CONSOLE_PORT: $MINIO_CONSOLE_PORT"
    echo -e "  ${YELLOW}•${NC} PGADMIN_PORT: $PGADMIN_PORT"
    echo
    echo -e "${PURPLE}${ROCKET} Bước tiếp theo:${NC}"
    echo -e "  ${YELLOW}•${NC} docker-compose up -d"
    echo -e "  ${YELLOW}•${NC} npm run dev"
    echo
    echo -e "${RED}${WARNING} Lưu ý: Không commit .env.prod vào git!${NC}"
    echo
}

# Main execution
main() {
    # Parse arguments
    parse_args "$@"
    
    # Show help if requested
    if [[ "$SHOW_HELP" == true ]]; then
        show_help
        exit 0
    fi
    
    # Get project configuration if not all set via command line
    if [[ "$CREATE_ENV" == true ]]; then
        # Check if project name was set via command line
        local project_name_set=false
        for arg in "$@"; do
            if [[ "$arg" == "--project" ]]; then
                project_name_set=true
                break
            fi
        done
        
        # If project name or ports not set via command line, get user input
        if [[ "$project_name_set" == false ]]; then
            get_project_config
        fi
    fi
    
    # Create env file
    if [[ "$CREATE_ENV" == true ]]; then
        create_env_file
    fi
    
    # Show final results
    show_results
}

# Run main function
main "$@"
