#!/bin/bash

# 🚀 Next.js Startup Performance Benchmark
# Version: 1.0.0

set -euo pipefail

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Banner
show_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                      🚀 Next.js Startup Benchmark                           ║
║                                                                              ║
║    Measures startup performance with different optimization levels           ║
║    Version: 1.0.0                                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Kill any existing Next.js processes
cleanup_processes() {
    log "Cleaning up existing processes..."
    pkill -f "next start" 2>/dev/null || true
    pkill -f "node.*next" 2>/dev/null || true
    sleep 2
}

# Extract startup time from Next.js output
extract_startup_time() {
    local output="$1"
    echo "$output" | grep -o "Ready in [0-9]*ms" | grep -o "[0-9]*" || echo "0"
}

# Run benchmark test
run_benchmark() {
    local test_name="$1"
    local command="$2"
    local description="$3"
    
    log "Testing: $test_name"
    info "$description"
    
    cleanup_processes
    
    # Capture output and timing
    local start_time=$(date +%s%N)
    local output=$(timeout 30s bash -c "$command" 2>&1 | head -20 || true)
    local end_time=$(date +%s%N)
    
    # Calculate timing
    local total_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    local ready_time=$(extract_startup_time "$output")
    
    # Kill the process after measurement
    pkill -f "next start" 2>/dev/null || true
    
    echo -e "${CYAN}Results for $test_name:${NC}"
    echo "  Ready Time: ${ready_time}ms"
    echo "  Total Time: ${total_time}ms"
    echo "  Command: $command"
    echo
    
    # Return ready time for comparison
    echo "$ready_time"
}

# Main benchmark function
main() {
    show_banner
    
    # Check if we're in the right directory
    if [[ ! -f "site/package.json" ]]; then
        error "Please run this script from the project root directory"
        exit 1
    fi
    
    log "Starting Next.js startup performance benchmark..."
    echo
    
    # Array to store results
    declare -a results=()
    declare -a test_names=()
    
    # Test 1: Standard start
    test_names+=("Standard Start")
    results+=($(run_benchmark "Standard Start" "cd site && timeout 15s bun run start" "Standard Next.js startup"))
    
    # Test 2: Optimized start
    test_names+=("Optimized Start")
    results+=($(run_benchmark "Optimized Start" "cd site && timeout 15s bun run start:optimized" "Optimized with environment variables"))
    
    # Test 3: Fast start
    test_names+=("Fast Start")
    results+=($(run_benchmark "Fast Start" "cd site && timeout 15s bun run start:fast" "Fast startup with memory optimization"))
    
    # Test 4: Turbo start (if available)
    if grep -q "start:turbo" site/package.json; then
        test_names+=("Turbo Start")
        results+=($(run_benchmark "Turbo Start" "cd site && timeout 15s bun run start:turbo" "Turbo mode startup"))
    fi
    
    # Summary
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                              📊 BENCHMARK RESULTS                           ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    # Find best result
    local best_time=999999
    local best_test=""
    
    for i in "${!results[@]}"; do
        local time="${results[$i]}"
        local name="${test_names[$i]}"
        
        if [[ "$time" -gt 0 ]] && [[ "$time" -lt "$best_time" ]]; then
            best_time="$time"
            best_test="$name"
        fi
        
        echo -e "${BLUE}$name:${NC} ${time}ms"
    done
    
    echo
    if [[ "$best_test" != "" ]]; then
        success "🏆 Best Performance: $best_test ($best_time ms)"
        
        # Performance recommendations
        echo
        echo -e "${YELLOW}📈 Performance Recommendations:${NC}"
        
        if [[ "$best_time" -lt 800 ]]; then
            echo "  ✅ Excellent performance! Startup time under 800ms"
        elif [[ "$best_time" -lt 1000 ]]; then
            echo "  🔵 Good performance! Consider additional optimizations"
        elif [[ "$best_time" -lt 1500 ]]; then
            echo "  🟡 Moderate performance. Try optimized configurations"
        else
            echo "  🔴 Slow startup. Consider reviewing application structure"
        fi
        
        echo
        echo -e "${BLUE}🚀 To use the best performing configuration:${NC}"
        if [[ "$best_test" == "Optimized Start" ]]; then
            echo "  bun run start:fast"
        elif [[ "$best_test" == "Fast Start" ]]; then
            echo "  bun run start:fast"
        elif [[ "$best_test" == "Turbo Start" ]]; then
            echo "  bun run start:turbo"
        else
            echo "  bun run start"
        fi
    else
        warning "No successful startup measurements recorded"
    fi
    
    echo
    success "Benchmark completed!"
}

# Cleanup on exit
trap cleanup_processes EXIT

# Run main function
main "$@"
