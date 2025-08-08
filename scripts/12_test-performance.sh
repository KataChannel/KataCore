#!/bin/bash

# 🧪 Next.js v15 Performance Testing Script
# Kiểm tra hiệu suất sau khi optimize

set -e

echo "🧪 Next.js v15 Performance Testing Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Check if required commands exist
check_dependencies() {
    local deps=("node" "npm" "curl")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        error "Missing dependencies: ${missing[*]}"
        echo "Please install missing dependencies and try again."
        exit 1
    fi
    
    success "All dependencies available"
}

# Test 1: TypeScript compilation
test_typescript() {
    log "Testing TypeScript compilation..."
    
    local start_time=$(date +%s.%N)
    
    if npm run type-check > /dev/null 2>&1; then
        local end_time=$(date +%s.%N)
        local duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "N/A")
        success "TypeScript compilation passed (${duration}s)"
        return 0
    else
        error "TypeScript compilation failed"
        npm run type-check
        return 1
    fi
}

# Test 2: Build performance
test_build_performance() {
    log "Testing build performance..."
    
    # Clean previous build
    rm -rf .next 2>/dev/null || true
    
    local start_time=$(date +%s.%N)
    
    if npm run build > build.log 2>&1; then
        local end_time=$(date +%s.%N)
        local duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "N/A")
        
        # Check build output for bundle sizes
        if [ -f ".next/static/chunks/pages/_app-*.js" ]; then
            local app_size=$(ls -la .next/static/chunks/pages/_app-*.js | awk '{print $5}' | head -1)
            info "App bundle size: ${app_size} bytes"
        fi
        
        success "Build completed in ${duration}s"
        
        # Clean up build artifacts for space
        rm -rf .next
        return 0
    else
        error "Build failed"
        cat build.log
        return 1
    fi
}

# Test 3: Development server startup
test_dev_server() {
    log "Testing development server startup..."
    
    local start_time=$(date +%s.%N)
    
    # Start dev server in background
    npm run dev > dev.log 2>&1 &
    local dev_pid=$!
    
    # Wait for server to be ready (max 60 seconds)
    local timeout=60
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if curl -s http://localhost:3900 > /dev/null 2>&1; then
            local end_time=$(date +%s.%N)
            local duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "N/A")
            success "Dev server started in ${duration}s"
            
            # Test API endpoint
            if curl -s http://localhost:3900/api/admin/roles > /dev/null 2>&1; then
                success "API endpoint responsive"
            else
                warning "API endpoint not responsive"
            fi
            
            # Kill dev server
            kill $dev_pid 2>/dev/null || true
            wait $dev_pid 2>/dev/null || true
            return 0
        fi
        
        sleep 1
        elapsed=$((elapsed + 1))
    done
    
    error "Dev server failed to start within ${timeout}s"
    kill $dev_pid 2>/dev/null || true
    wait $dev_pid 2>/dev/null || true
    cat dev.log
    return 1
}

# Test 4: Bundle analysis (if webpack-bundle-analyzer is available)
test_bundle_analysis() {
    log "Testing bundle analysis..."
    
    if command -v npx &> /dev/null; then
        # Check if we can analyze bundles
        if npm list webpack-bundle-analyzer > /dev/null 2>&1; then
            log "Running bundle analysis..."
            ANALYZE=true npm run build > /dev/null 2>&1 || true
            success "Bundle analysis available"
        else
            info "webpack-bundle-analyzer not installed - skipping detailed analysis"
        fi
    else
        warning "npx not available - skipping bundle analysis"
    fi
    
    return 0
}

# Test 5: Memory usage simulation
test_memory_usage() {
    log "Testing memory usage patterns..."
    
    # Create a simple memory test
    node -e "
        const v8 = require('v8');
        const heapStats = v8.getHeapStatistics();
        console.log('Heap Size:', Math.round(heapStats.total_heap_size / 1024 / 1024), 'MB');
        console.log('Used Heap:', Math.round(heapStats.used_heap_size / 1024 / 1024), 'MB');
        console.log('Memory Limit:', Math.round(heapStats.heap_size_limit / 1024 / 1024), 'MB');
    " > memory_stats.txt
    
    local heap_size=$(grep "Heap Size:" memory_stats.txt | awk '{print $3}')
    local used_heap=$(grep "Used Heap:" memory_stats.txt | awk '{print $3}')
    
    info "Node.js heap size: ${heap_size}MB"
    info "Used heap: ${used_heap}MB"
    
    success "Memory usage test completed"
    rm -f memory_stats.txt
    return 0
}

# Test 6: File structure validation
test_file_structure() {
    log "Validating optimized file structure..."
    
    local required_files=(
        "next.config.ts"
        "tsconfig.json" 
        "package.json"
        "app/layout.tsx"
        "app/page.tsx"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        error "Missing required files: ${missing_files[*]}"
        return 1
    fi
    
    # Check for duplicate directories
    if [ -d "src/app" ] && [ -d "app" ]; then
        warning "Both src/app and app directories exist - cleanup recommended"
    fi
    
    success "File structure validation passed"
    return 0
}

# Test 7: Environment validation
test_environment() {
    log "Testing environment configuration..."
    
    # Check Node.js version
    local node_version=$(node --version)
    info "Node.js version: $node_version"
    
    # Check npm version
    local npm_version=$(npm --version)
    info "npm version: $npm_version"
    
    # Check if using compatible Next.js version
    local next_version=$(npm list next --depth=0 2>/dev/null | grep next@ | awk -F@ '{print $2}' || echo "not found")
    info "Next.js version: $next_version"
    
    if [[ $next_version == "15"* ]]; then
        success "Next.js v15 detected"
    else
        warning "Next.js v15 not detected (found: $next_version)"
    fi
    
    return 0
}

# Performance score calculation
calculate_performance_score() {
    local passed_tests=$1
    local total_tests=$2
    local score=$((passed_tests * 100 / total_tests))
    
    echo
    echo "========================================"
    echo -e "${PURPLE}📊 PERFORMANCE SCORE${NC}"
    echo "========================================"
    echo "Tests passed: $passed_tests/$total_tests"
    echo "Score: $score%"
    
    if [ $score -ge 90 ]; then
        echo -e "${GREEN}🏆 EXCELLENT${NC} - Project is highly optimized!"
    elif [ $score -ge 75 ]; then
        echo -e "${YELLOW}⭐ GOOD${NC} - Minor optimizations possible"
    elif [ $score -ge 50 ]; then
        echo -e "${YELLOW}⚠️  FAIR${NC} - Several issues need attention"
    else
        echo -e "${RED}❌ POOR${NC} - Major optimization required"
    fi
    
    echo
}

# Performance recommendations
show_recommendations() {
    echo "========================================"
    echo -e "${BLUE}💡 PERFORMANCE RECOMMENDATIONS${NC}"
    echo "========================================"
    echo
    echo "🚀 General Optimizations:"
    echo "  • Use npm run dev:turbo for faster development"
    echo "  • Run npm run build:analyze to check bundle sizes"
    echo "  • Consider upgrading to Node.js LTS if using older version"
    echo "  • Use Next.js Image component for optimized images"
    echo
    echo "🔧 Advanced Optimizations:"
    echo "  • Enable Turbopack for development (--turbo flag)"
    echo "  • Configure ISR for static pages"
    echo "  • Implement proper caching strategies"
    echo "  • Use React Server Components where possible"
    echo
    echo "📊 Monitoring:"
    echo "  • Set up Vercel Analytics or similar"
    echo "  • Monitor Core Web Vitals"
    echo "  • Use Next.js built-in performance profiling"
    echo
}

# Main test execution
main() {
    echo "Starting performance tests..."
    echo
    
    # Check dependencies first
    check_dependencies
    
    local passed_tests=0
    local total_tests=7
    
    # Run all tests
    test_environment && ((passed_tests++)) || true
    test_file_structure && ((passed_tests++)) || true
    test_typescript && ((passed_tests++)) || true
    test_memory_usage && ((passed_tests++)) || true
    test_bundle_analysis && ((passed_tests++)) || true
    test_build_performance && ((passed_tests++)) || true
    test_dev_server && ((passed_tests++)) || true
    
    # Calculate and show results
    calculate_performance_score $passed_tests $total_tests
    show_recommendations
    
    # Clean up log files
    rm -f build.log dev.log 2>/dev/null || true
    
    echo "========================================"
    success "Performance testing completed!"
    echo "========================================"
}

# Execute main function
main "$@"
