#!/bin/bash

# KataCore Configuration Validation Script
# Validates deployment configurations and environment files
# Author: KataCore Team
# Version: 1.0.0

set -euo pipefail

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Icons
readonly SUCCESS="✅"
readonly ERROR="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Logging functions
log_success() { echo -e "${SUCCESS} ${GREEN}$1${NC}"; }
log_error() { echo -e "${ERROR} ${RED}$1${NC}"; }
log_warning() { echo -e "${WARNING} ${YELLOW}$1${NC}"; }
log_info() { echo -e "${INFO} ${BLUE}$1${NC}"; }
log_header() { echo -e "${CYAN}=== $1 ===${NC}"; }

# Validation functions
validate_environment_file() {
    local env_file="$1"
    local env_name=$(basename "$env_file" .conf)
    
    log_header "Validating $env_name environment"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    local issues=0
    
    # Check required variables
    local required_vars=(
        "SERVER_IP"
        "SSH_USER"
        "PROJECT_NAME"
        "DOCKER_COMPOSE_FILE"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$env_file"; then
            log_error "Missing required variable: $var"
            ((issues++))
        else
            log_success "Found required variable: $var"
        fi
    done
    
    # Validate IP address format
    if grep -q "^SERVER_IP=" "$env_file"; then
        local server_ip=$(grep "^SERVER_IP=" "$env_file" | cut -d'=' -f2 | tr -d '"')
        if [[ $server_ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            log_success "Valid IP address format: $server_ip"
        else
            log_warning "Invalid IP address format: $server_ip"
            ((issues++))
        fi
    fi
    
    # Check Docker Compose file exists
    if grep -q "^DOCKER_COMPOSE_FILE=" "$env_file"; then
        local compose_file=$(grep "^DOCKER_COMPOSE_FILE=" "$env_file" | cut -d'=' -f2 | tr -d '"')
        if [[ -f "$PROJECT_ROOT/$compose_file" ]] || [[ -f "$PROJECT_ROOT/configs/docker/$compose_file" ]]; then
            log_success "Docker Compose file exists: $compose_file"
        else
            log_error "Docker Compose file not found: $compose_file"
            ((issues++))
        fi
    fi
    
    if [[ $issues -eq 0 ]]; then
        log_success "Environment $env_name validation passed"
        return 0
    else
        log_error "Environment $env_name validation failed with $issues issues"
        return 1
    fi
}

validate_docker_compose() {
    local compose_file="$1"
    
    log_header "Validating Docker Compose: $(basename "$compose_file")"
    
    if [[ ! -f "$compose_file" ]]; then
        log_error "Docker Compose file not found: $compose_file"
        return 1
    fi
    
    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose command not found"
        return 1
    fi
    
    # Validate compose file syntax
    if docker-compose -f "$compose_file" config > /dev/null 2>&1; then
        log_success "Docker Compose syntax is valid"
    else
        log_error "Docker Compose syntax validation failed"
        docker-compose -f "$compose_file" config
        return 1
    fi
    
    # Check for required services
    local required_services=("app" "postgres" "redis")
    local found_services=$(docker-compose -f "$compose_file" config --services 2>/dev/null)
    
    for service in "${required_services[@]}"; do
        if echo "$found_services" | grep -q "^$service$"; then
            log_success "Required service found: $service"
        else
            log_warning "Optional service not found: $service"
        fi
    done
    
    return 0
}

validate_ssh_configuration() {
    log_header "Validating SSH Configuration"
    
    # Check if SSH client is available
    if ! command -v ssh &> /dev/null; then
        log_error "SSH client not found"
        return 1
    fi
    
    log_success "SSH client is available"
    
    # Check for common SSH keys
    local ssh_keys=(
        "$HOME/.ssh/id_rsa"
        "$HOME/.ssh/id_ed25519"
        "$HOME/.ssh/katacore-deploy"
    )
    
    local found_keys=0
    for key in "${ssh_keys[@]}"; do
        if [[ -f "$key" ]]; then
            log_success "SSH key found: $key"
            ((found_keys++))
            
            # Check key permissions
            local perms=$(stat -c "%a" "$key" 2>/dev/null || stat -f "%OLp" "$key" 2>/dev/null)
            if [[ "$perms" == "600" ]]; then
                log_success "SSH key has correct permissions: $key"
            else
                log_warning "SSH key has incorrect permissions ($perms): $key"
                log_info "Run: chmod 600 $key"
            fi
        fi
    done
    
    if [[ $found_keys -eq 0 ]]; then
        log_warning "No SSH keys found. Consider generating one with: ssh-keygen -t ed25519"
    fi
    
    return 0
}

validate_project_structure() {
    log_header "Validating Project Structure"
    
    # Check required directories
    local required_dirs=(
        "site"
        "api"
        "docs"
        "scripts"
        "deployment"
        "configs"
    )
    
    local issues=0
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$PROJECT_ROOT/$dir" ]]; then
            log_success "Required directory found: $dir"
        else
            log_error "Required directory missing: $dir"
            ((issues++))
        fi
    done
    
    # Check required files
    local required_files=(
        "package.json"
        "docker-compose.yml"
        "README.md"
        "deploy.sh"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$PROJECT_ROOT/$file" ]]; then
            log_success "Required file found: $file"
        else
            log_error "Required file missing: $file"
            ((issues++))
        fi
    done
    
    # Check deployment scripts
    local deployment_scripts=(
        "deployment/scripts/deploy-production.sh"
        "deployment/scripts/deploy-remote-fixed.sh"
        "deployment/scripts/quick-deploy-enhanced.sh"
    )
    
    for script in "${deployment_scripts[@]}"; do
        if [[ -f "$PROJECT_ROOT/$script" ]]; then
            log_success "Deployment script found: $script"
            
            # Check if executable
            if [[ -x "$PROJECT_ROOT/$script" ]]; then
                log_success "Script is executable: $script"
            else
                log_warning "Script is not executable: $script"
                log_info "Run: chmod +x $PROJECT_ROOT/$script"
            fi
        else
            log_error "Deployment script missing: $script"
            ((issues++))
        fi
    done
    
    if [[ $issues -eq 0 ]]; then
        log_success "Project structure validation passed"
        return 0
    else
        log_error "Project structure validation failed with $issues issues"
        return 1
    fi
}

validate_dependencies() {
    log_header "Validating Dependencies"
    
    # Check required system commands
    local required_commands=(
        "docker"
        "docker-compose"
        "curl"
        "jq"
        "ssh"
        "git"
        "tar"
        "gzip"
    )
    
    local missing_deps=()
    for cmd in "${required_commands[@]}"; do
        if command -v "$cmd" &> /dev/null; then
            local version=$(${cmd} --version 2>&1 | head -n1 || echo "unknown")
            log_success "$cmd is available: $version"
        else
            log_error "Missing required command: $cmd"
            missing_deps+=("$cmd")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install missing dependencies before deployment"
        return 1
    fi
    
    log_success "All required dependencies are available"
    return 0
}

validate_network_connectivity() {
    log_header "Validating Network Connectivity"
    
    # Test internet connectivity
    if curl -s --connect-timeout 5 https://www.google.com > /dev/null; then
        log_success "Internet connectivity is working"
    else
        log_error "No internet connectivity detected"
        return 1
    fi
    
    # Test Docker Hub connectivity
    if curl -s --connect-timeout 5 https://hub.docker.com > /dev/null; then
        log_success "Docker Hub is accessible"
    else
        log_warning "Docker Hub may not be accessible"
    fi
    
    return 0
}

generate_validation_report() {
    local output_file="$PROJECT_ROOT/validation-report.txt"
    
    log_header "Generating Validation Report"
    
    {
        echo "KataCore Configuration Validation Report"
        echo "Generated on: $(date)"
        echo "========================================"
        echo
        
        echo "Project Root: $PROJECT_ROOT"
        echo "Script Version: 1.0.0"
        echo
        
        echo "Validation Results:"
        echo "==================="
        
        # Run all validations and capture results
        validate_dependencies && echo "✅ Dependencies: PASS" || echo "❌ Dependencies: FAIL"
        validate_project_structure && echo "✅ Project Structure: PASS" || echo "❌ Project Structure: FAIL"
        validate_ssh_configuration && echo "✅ SSH Configuration: PASS" || echo "❌ SSH Configuration: FAIL"
        validate_network_connectivity && echo "✅ Network Connectivity: PASS" || echo "❌ Network Connectivity: FAIL"
        
        echo
        echo "Environment Files:"
        echo "=================="
        
        # Validate environment files
        for env_file in "$PROJECT_ROOT"/configs/environments/*.conf; do
            if [[ -f "$env_file" ]]; then
                local env_name=$(basename "$env_file" .conf)
                validate_environment_file "$env_file" &>/dev/null && echo "✅ $env_name: PASS" || echo "❌ $env_name: FAIL"
            fi
        done
        
        echo
        echo "Docker Compose Files:"
        echo "===================="
        
        # Validate Docker Compose files
        for compose_file in "$PROJECT_ROOT"/configs/docker/*.yml; do
            if [[ -f "$compose_file" ]]; then
                local compose_name=$(basename "$compose_file")
                validate_docker_compose "$compose_file" &>/dev/null && echo "✅ $compose_name: PASS" || echo "❌ $compose_name: FAIL"
            fi
        done
        
        echo
        echo "Recommendations:"
        echo "==============="
        echo "1. Ensure all failing validations are addressed before deployment"
        echo "2. Test SSH connectivity to target servers manually"
        echo "3. Verify environment-specific configurations are correct"
        echo "4. Run deployment in a test environment first"
        
    } > "$output_file"
    
    log_success "Validation report generated: $output_file"
}

show_help() {
    cat << EOF
${CYAN}KataCore Configuration Validator${NC}

${BLUE}USAGE:${NC}
    $0 [OPTIONS] [COMMAND]

${BLUE}COMMANDS:${NC}
    ${GREEN}all${NC}            Run all validations (default)
    ${GREEN}env${NC}            Validate environment files
    ${GREEN}docker${NC}         Validate Docker configurations
    ${GREEN}ssh${NC}            Validate SSH configuration
    ${GREEN}structure${NC}      Validate project structure
    ${GREEN}deps${NC}           Validate dependencies
    ${GREEN}network${NC}        Validate network connectivity
    ${GREEN}report${NC}         Generate validation report

${BLUE}OPTIONS:${NC}
    -h, --help         Show this help message
    -v, --verbose      Verbose output

${BLUE}EXAMPLES:${NC}
    $0                 # Run all validations
    $0 env             # Validate only environment files
    $0 report          # Generate validation report

EOF
}

main() {
    local command=${1:-all}
    
    case $command in
        "all")
            log_info "Running comprehensive validation..."
            local total_issues=0
            
            validate_dependencies || ((total_issues++))
            validate_project_structure || ((total_issues++))
            validate_ssh_configuration || ((total_issues++))
            validate_network_connectivity || ((total_issues++))
            
            # Validate environment files
            for env_file in "$PROJECT_ROOT"/configs/environments/*.conf; do
                [[ -f "$env_file" ]] && { validate_environment_file "$env_file" || ((total_issues++)); }
            done
            
            # Validate Docker Compose files
            for compose_file in "$PROJECT_ROOT"/configs/docker/*.yml; do
                [[ -f "$compose_file" ]] && { validate_docker_compose "$compose_file" || ((total_issues++)); }
            done
            
            if [[ $total_issues -eq 0 ]]; then
                log_success "All validations passed! Ready for deployment."
                exit 0
            else
                log_error "Validation completed with $total_issues issues. Please address them before deployment."
                exit 1
            fi
            ;;
        "env")
            for env_file in "$PROJECT_ROOT"/configs/environments/*.conf; do
                [[ -f "$env_file" ]] && validate_environment_file "$env_file"
            done
            ;;
        "docker")
            for compose_file in "$PROJECT_ROOT"/configs/docker/*.yml; do
                [[ -f "$compose_file" ]] && validate_docker_compose "$compose_file"
            done
            ;;
        "ssh")
            validate_ssh_configuration
            ;;
        "structure")
            validate_project_structure
            ;;
        "deps")
            validate_dependencies
            ;;
        "network")
            validate_network_connectivity
            ;;
        "report")
            generate_validation_report
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Change to project root
cd "$PROJECT_ROOT"

# Execute main function
main "$@"
