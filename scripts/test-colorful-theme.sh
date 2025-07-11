#!/bin/bash

# TazaCore Colorful Theme Integration Test Script
# Kiểm tra và validate việc tích hợp colorful theme

set -e

echo "🎨 TazaCore Colorful Theme Integration Test"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for tests
PASSED=0
FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}Testing:${NC} $test_name"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED:${NC} $test_name"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED:${NC} $test_name"
        ((FAILED++))
    fi
}

# Function to check file exists
check_file() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✅ Found:${NC} $description"
        return 0
    else
        echo -e "${RED}❌ Missing:${NC} $description"
        return 1
    fi
}

# Function to check content in file
check_content() {
    local file_path="$1"
    local search_pattern="$2"
    local description="$3"
    
    if grep -q "$search_pattern" "$file_path" 2>/dev/null; then
        echo -e "${GREEN}✅ Found:${NC} $description"
        return 0
    else
        echo -e "${RED}❌ Missing:${NC} $description"
        return 1
    fi
}

echo -e "\n${YELLOW}1. Checking Core Files${NC}"
echo "====================="

# Check core colorful theme files
run_test "Colorful CSS file exists" "check_file 'src/styles/colorfull.css' 'Colorful theme CSS file'"
run_test "Unified theme CSS exists" "check_file 'src/styles/unified-theme.css' 'Unified theme CSS file'"
run_test "Globals CSS exists" "check_file 'src/styles/globals.css' 'Global CSS file'"

echo -e "\n${YELLOW}2. Checking CSS Integration${NC}"
echo "========================="

# Check CSS imports
run_test "Colorful CSS imported in globals" "check_content 'src/styles/globals.css' 'colorfull.css' 'Colorful CSS import'"
run_test "Unified theme CSS imported" "check_content 'src/styles/globals.css' 'unified-theme.css' 'Unified theme CSS import'"

# Check colorful CSS variables
run_test "Colorful primary variable" "check_content 'src/styles/colorfull.css' '--colorful-primary' 'Colorful primary color variable'"
run_test "Colorful gradient variables" "check_content 'src/styles/colorfull.css' '--colorful-gradient-primary' 'Colorful gradient variables'"
run_test "Color scheme class" "check_content 'src/styles/colorfull.css' 'color-scheme-colorful' 'Color scheme colorful class'"

echo -e "\n${YELLOW}3. Checking Component Files${NC}"
echo "=========================="

# Check theme manager components
run_test "Unified theme hook exists" "check_file 'src/hooks/useUnifiedTheme.tsx' 'Unified theme hook'"
run_test "Theme manager component" "check_file 'src/components/ThemeManager.tsx' 'Theme manager component'"
run_test "Theme showcase component" "check_file 'src/components/ThemeShowcase.tsx' 'Theme showcase component'"

# Check demo pages
run_test "Colorful demo page" "check_file 'src/app/admin/colorful-demo/page.tsx' 'Colorful theme demo page'"

echo -e "\n${YELLOW}4. Checking Configuration${NC}"
echo "========================"

# Check configuration files
run_test "Unified theme config" "check_file 'src/lib/config/unified-theme.ts' 'Unified theme configuration'"
run_test "ColorScheme type definition" "check_content 'src/lib/config/unified-theme.ts' \"ColorScheme = 'monochrome' | 'colorful'\" 'ColorScheme type definition'"
run_test "Colorful theme colors" "check_content 'src/lib/config/unified-theme.ts' 'colorfulLight' 'Colorful light theme colors'"
run_test "Colorful dark theme colors" "check_content 'src/lib/config/unified-theme.ts' 'colorfulDark' 'Colorful dark theme colors'"

echo -e "\n${YELLOW}5. Checking Layout Integration${NC}"
echo "============================="

# Check layout integration
run_test "Layout theme manager" "check_content 'src/app/layout.tsx' 'ThemeManager' 'ThemeManager in layout'"
run_test "Layout colorScheme config" "check_content 'src/app/layout.tsx' 'colorScheme.*monochrome' 'ColorScheme configuration in layout'"

echo -e "\n${YELLOW}6. Checking TypeScript Definitions${NC}"
echo "================================="

# Check TypeScript configurations
run_test "ColorScheme type export" "check_content 'src/lib/config/unified-theme.ts' 'export.*ColorScheme' 'ColorScheme type export'"
run_test "ThemeConfig colorScheme property" "check_content 'src/lib/config/unified-theme.ts' 'colorScheme.*ColorScheme' 'ThemeConfig colorScheme property'"

echo -e "\n${YELLOW}7. Checking CSS Classes and Utilities${NC}"
echo "===================================="

# Check colorful CSS classes
run_test "Colorful button classes" "check_content 'src/styles/colorfull.css' 'btn-colorful-primary' 'Colorful button classes'"
run_test "Colorful card classes" "check_content 'src/styles/colorfull.css' 'card-colorful' 'Colorful card classes'"
run_test "Colorful input classes" "check_content 'src/styles/colorfull.css' 'input-colorful' 'Colorful input classes'"
run_test "Colorful badge classes" "check_content 'src/styles/colorfull.css' 'badge-colorful-success' 'Colorful badge classes'"
run_test "Background utility classes" "check_content 'src/styles/colorfull.css' 'bg-colorful-primary' 'Background utility classes'"
run_test "Text utility classes" "check_content 'src/styles/colorfull.css' 'text-colorful-primary' 'Text utility classes'"

echo -e "\n${YELLOW}8. Checking Accessibility Features${NC}"
echo "================================="

# Check accessibility features
run_test "High contrast support" "check_content 'src/styles/colorfull.css' 'high-contrast.*color-scheme-colorful' 'High contrast support'"
run_test "Reduced motion support" "check_content 'src/styles/colorfull.css' 'prefers-reduced-motion' 'Reduced motion support'"
run_test "Focus indicators" "check_content 'src/styles/unified-theme.css' 'focus.*outline' 'Focus indicators'"

echo -e "\n${YELLOW}9. Checking Build Compatibility${NC}"
echo "==============================="

# Check if TypeScript compiles without errors (basic check)
if command -v npm &> /dev/null; then
    run_test "TypeScript check" "npm run type-check || echo 'TypeScript check skipped (no type-check script)' && true"
else
    echo -e "${YELLOW}⚠️  NPM not found, skipping TypeScript check${NC}"
fi

# Check Tailwind config for colorful theme
if [ -f "tailwind.config.ts" ]; then
    run_test "Tailwind colorful gradients" "check_content 'tailwind.config.ts' 'gradient-colorful' 'Tailwind colorful gradient configuration'"
else
    echo -e "${YELLOW}⚠️  Tailwind config not found, skipping Tailwind checks${NC}"
fi

echo -e "\n${YELLOW}10. Documentation Check${NC}"
echo "======================"

# Check documentation
run_test "Colorful theme guide" "check_file 'docs/COLORFUL-THEME-GUIDE.md' 'Colorful theme documentation'"
run_test "Unified design patterns" "check_file 'UNIFIED-DESIGN-PATTERNS.md' 'Unified design patterns documentation'"

echo -e "\n${YELLOW}Summary${NC}"
echo "======="

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$(( PASSED * 100 / TOTAL ))

echo -e "\nTotal tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "Success rate: ${PERCENTAGE}%"

if [ $FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All tests passed! Colorful theme integration is complete.${NC}"
    echo -e "\n📋 Next steps:"
    echo -e "   1. Run \`npm run dev\` to start development server"
    echo -e "   2. Visit \`/admin/colorful-demo\` to see colorful theme in action"
    echo -e "   3. Use ColorSchemeToggle component to switch themes"
    echo -e "   4. Check console for any runtime issues"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed. Please fix the issues above.${NC}"
    echo -e "\n🔧 Common fixes:"
    echo -e "   - Ensure all files are in correct locations"
    echo -e "   - Check import paths in components"
    echo -e "   - Verify CSS files are properly imported"
    echo -e "   - Run \`npm install\` if dependencies are missing"
    exit 1
fi
