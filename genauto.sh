#!/bin/bash

# 🔐 KataCore Auto-Generated Security Script
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
readonly KEY="🔑"
readonly FOLDER="📁"
readonly SHIELD="🛡️"

# Default options
CREATE_ENV=false
CREATE_SSH=false
SHOW_HELP=false

# Logging functions
log() { echo -e "${CYAN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}${INFO} $1${NC}"; }
success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
error() { echo -e "${RED}${CROSS} $1${NC}"; exit 1; }

# Show help
show_help() {
    echo -e "${BLUE}Sử dụng: $0 [OPTIONS]${NC}"
    echo
    echo -e "${YELLOW}Tùy chọn:${NC}"
    echo -e "  ${GREEN}--env${NC}      Tạo file .env.local"
    echo -e "  ${GREEN}--ssh${NC}      Tạo SSH keys"
    echo -e "  ${GREEN}--all${NC}      Tạo cả env và SSH keys"
    echo -e "  ${GREEN}--help${NC}     Hiển thị trợ giúp này"
    echo
    echo -e "${YELLOW}Ví dụ:${NC}"
    echo -e "  $0 --env           # Chỉ tạo .env.local"
    echo -e "  $0 --ssh           # Chỉ tạo SSH keys"
    echo -e "  $0 --all           # Tạo cả hai"
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
            --ssh)
                CREATE_SSH=true
                shift
                ;;
            --all)
                CREATE_ENV=true
                CREATE_SSH=true
                shift
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
    
    # If no options provided, show interactive menu
    if [[ "$CREATE_ENV" == false && "$CREATE_SSH" == false && "$SHOW_HELP" == false ]]; then
        show_interactive_menu
    fi
}

# Interactive menu
show_interactive_menu() {
    clear
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                     🔐 KATACORE SECURITY GENERATOR                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo
    echo -e "${YELLOW}Chọn những gì bạn muốn tạo:${NC}"
    echo
    echo -e "  ${GREEN}1)${NC} Tạo file .env.local"
    echo -e "  ${GREEN}2)${NC} Tạo SSH keys"
    echo -e "  ${GREEN}3)${NC} Tạo cả hai"
    echo -e "  ${GREEN}4)${NC} Thoát"
    echo
    read -p "Nhập lựa chọn (1-4): " choice
    
    case $choice in
        1)
            CREATE_ENV=true
            ;;
        2)
            CREATE_SSH=true
            ;;
        3)
            CREATE_ENV=true
            CREATE_SSH=true
            ;;
        4)
            echo -e "${CYAN}Tạm biệt!${NC}"
            exit 0
            ;;
        *)
            warning "Lựa chọn không hợp lệ"
            show_interactive_menu
            ;;
    esac
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

# Get SSH key parameters from user
get_ssh_params() {
    echo
    echo -e "${BLUE}${KEY} Cấu hình SSH Key${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    
    # Key name
    echo -e "${YELLOW}Tên key (Enter để sử dụng mặc định):${NC}"
    read -p "Tên key [katacore_$(date +%Y%m%d)]: " key_name
    key_name=${key_name:-"katacore_$(date +%Y%m%d)"}
    
    # Key type
    echo
    echo -e "${YELLOW}Loại key:${NC}"
    echo -e "  ${GREEN}1)${NC} ed25519 (khuyến nghị)"
    echo -e "  ${GREEN}2)${NC} rsa 4096"
    echo -e "  ${GREEN}3)${NC} ecdsa 521"
    read -p "Chọn loại key [1]: " key_type_choice
    
    case ${key_type_choice:-1} in
        1)
            key_type="ed25519"
            key_size=""
            ;;
        2)
            key_type="rsa"
            key_size="-b 4096"
            ;;
        3)
            key_type="ecdsa"
            key_size="-b 521"
            ;;
        *)
            key_type="ed25519"
            key_size=""
            ;;
    esac
    
    # Comment
    echo
    echo -e "${YELLOW}Comment cho key (Enter để sử dụng mặc định):${NC}"
    read -p "Comment [katacore@$(hostname)-$(date +%Y%m%d)]: " comment
    comment=${comment:-"katacore@$(hostname)-$(date +%Y%m%d)"}
    
    # Passphrase
    echo
    echo -e "${YELLOW}Bạn có muốn đặt passphrase cho key? (y/N):${NC}"
    read -p "Đặt passphrase? [N]: " use_passphrase
    
    if [[ "${use_passphrase,,}" == "y" || "${use_passphrase,,}" == "yes" ]]; then
        echo -e "${CYAN}Nhập passphrase (ẩn):${NC}"
        read -s -p "Passphrase: " passphrase
        echo
        read -s -p "Xác nhận passphrase: " passphrase_confirm
        echo
        
        if [[ "$passphrase" != "$passphrase_confirm" ]]; then
            error "Passphrase không khớp!"
        fi
    else
        passphrase=""
    fi
    
    # Custom path
    echo
    echo -e "${YELLOW}Đường dẫn lưu key (Enter để sử dụng ~/.ssh/):${NC}"
    read -p "Đường dẫn [~/.ssh/]: " custom_path
    ssh_dir=${custom_path:-"$HOME/.ssh"}
    
    # Expand tilde
    ssh_dir="${ssh_dir/#\~/$HOME}"
}

# Create SSH keys
create_ssh_keys() {
    log "Chuẩn bị tạo SSH keys..."
    
    # Get parameters from user
    get_ssh_params
    
    echo
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Thông tin SSH key sẽ tạo:${NC}"
    echo -e "  ${YELLOW}Tên:${NC} $key_name"
    echo -e "  ${YELLOW}Loại:${NC} $key_type"
    echo -e "  ${YELLOW}Comment:${NC} $comment"
    echo -e "  ${YELLOW}Đường dẫn:${NC} $ssh_dir"
    echo -e "  ${YELLOW}Passphrase:${NC} ${passphrase:+'Có'}"
    echo
    
    read -p "Tiếp tục tạo SSH key? (Y/n): " confirm
    if [[ "${confirm,,}" == "n" || "${confirm,,}" == "no" ]]; then
        warning "Hủy tạo SSH key"
        return
    fi
    
    log "Đang tạo SSH keys..."
    
    local private_key="$ssh_dir/${key_name}"
    local public_key="$ssh_dir/${key_name}.pub"
    
    # Create directory if not exists
    [[ ! -d "$ssh_dir" ]] && mkdir -p "$ssh_dir" && chmod 700 "$ssh_dir"
    
    # Check if key already exists
    if [[ -f "$private_key" ]]; then
        echo
        read -p "Key đã tồn tại. Ghi đè? (y/N): " overwrite
        if [[ "${overwrite,,}" != "y" && "${overwrite,,}" != "yes" ]]; then
            warning "Hủy tạo SSH key"
            return
        fi
    fi
    
    # Generate SSH key pair
    if [[ -n "$passphrase" ]]; then
        ssh-keygen -t "$key_type" $key_size -f "$private_key" -N "$passphrase" -C "$comment" &>/dev/null
    else
        ssh-keygen -t "$key_type" $key_size -f "$private_key" -N "" -C "$comment" &>/dev/null
    fi
    
    chmod 600 "$private_key"
    chmod 644 "$public_key"
    
    success "SSH keys đã tạo thành công!"
    echo -e "  ${CYAN}Private:${NC} $private_key"
    echo -e "  ${CYAN}Public:${NC}  $public_key"
    echo
    echo -e "${YELLOW}Public key content:${NC}"
    echo -e "${GREEN}$(cat "$public_key")${NC}"
    echo
    
    # Ask to add to ssh-agent
    if command -v ssh-agent &> /dev/null; then
        echo -e "${YELLOW}Bạn có muốn thêm key vào ssh-agent? (Y/n):${NC}"
        read -p "Thêm vào ssh-agent? [Y]: " add_agent
        if [[ "${add_agent,,}" != "n" && "${add_agent,,}" != "no" ]]; then
            if ssh-add "$private_key" 2>/dev/null; then
                success "Đã thêm key vào ssh-agent"
            else
                warning "Không thể thêm key vào ssh-agent (có thể cần passphrase)"
            fi
        fi
    fi
}

# Create .env.local file
create_env_file() {
    log "Tạo file .env.local..."
    
    # Generate all passwords
    local DB_PASSWORD=$(generate_password 8)
    local REDIS_PASSWORD=$(generate_password 8)
    local JWT_SECRET=$(generate_jwt_secret)
    local ENCRYPTION_KEY=$(generate_password 8)
    local MINIO_ROOT_PASSWORD=$(generate_password 8)
    local MINIO_ACCESS_KEY=$(generate_password 8)
    local PGADMIN_PASSWORD=$(generate_password 8)
    local GRAFANA_PASSWORD=$(generate_password 8)
    
    # Create .env.local file
    cat > .env.local << EOF
# 🔐 KataCore Auto-Generated Security Configuration
# Generated on: $(date '+%Y-%m-%d %H:%M:%S %Z')
# ===== DATABASE =====
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=katacore
POSTGRES_USER=katacore
DATABASE_URL=postgresql://katacore:$DB_PASSWORD@localhost:5432/katacore

# ===== REDIS =====
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=redis://:$REDIS_PASSWORD@localhost:6379/0

# ===== MINIO =====
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD
MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
MINIO_SECRET_KEY=$MINIO_ROOT_PASSWORD

# ===== SECURITY =====
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# ===== ADMIN TOOLS =====
PGADMIN_DEFAULT_EMAIL=admin@katacore.local
PGADMIN_DEFAULT_PASSWORD=$PGADMIN_PASSWORD
GRAFANA_ADMIN_PASSWORD=$GRAFANA_PASSWORD

# ===== APP CONFIG =====
NODE_ENV=development
API_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

    # Add to .gitignore if exists
    if [[ -f .gitignore ]] && ! grep -q ".env.local" .gitignore; then
        echo ".env.local" >> .gitignore
    fi
    
    success ".env.local đã tạo ($(wc -l < .env.local) dòng)"
}

# Show final results
show_results() {
    echo
    echo -e "${GREEN}${CHECK} ═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}${CHECK} HOÀN TẤT TẠO CẤU HÌNH KATACORE${NC}"
    echo -e "${GREEN}${CHECK} ═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo
    
    if [[ "$CREATE_ENV" == true ]]; then
        echo -e "${BLUE}${FOLDER} File .env.local:${NC} Đã tạo"
    fi
    
    if [[ "$CREATE_SSH" == true ]]; then
        echo -e "${BLUE}${KEY} SSH Keys:${NC} Đã tạo"
    fi
    
    echo
    echo -e "${PURPLE}${ROCKET} Bước tiếp theo:${NC}"
    
    if [[ "$CREATE_ENV" == true ]]; then
        echo -e "  ${YELLOW}•${NC} docker-compose up -d"
        echo -e "  ${YELLOW}•${NC} npm run dev"
    fi
    
    if [[ "$CREATE_SSH" == true ]]; then
        echo -e "  ${YELLOW}•${NC} Sử dụng key trong các kết nối SSH"
        echo -e "  ${YELLOW}•${NC} Thêm public key vào server/service cần thiết"
    fi
    
    echo
    echo -e "${RED}${WARNING} Lưu ý: Không commit .env.local và private key vào git!${NC}"
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
    
    # Execute requested operations
    if [[ "$CREATE_SSH" == true ]]; then
        create_ssh_keys
    fi
    
    if [[ "$CREATE_ENV" == true ]]; then
        create_env_file
    fi
    
    # Show final results
    show_results
}

# Run main function
main "$@"
