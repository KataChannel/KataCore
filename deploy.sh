#!/bin/bash

# Make the script executable
chmod +x ./sh/3pushauto.sh

# Check if required dependencies are installed
check_dependencies() {
    local missing_deps=()
    
    # Check for required commands
    for cmd in ssh git docker rsync; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo "❌ Missing required dependencies: ${missing_deps[*]}"
        echo "Please install the missing dependencies and try again."
        
        # Provide installation hints
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "On Ubuntu/Debian: sudo apt-get install ${missing_deps[*]}"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            echo "On macOS: brew install ${missing_deps[*]}"
        fi
        exit 1
    fi
}

# Check dependencies
echo "🔍 Checking dependencies..."
check_dependencies
echo "✅ All dependencies are installed"

# Run the main script
echo "🚀 Starting deployment script..."
./sh/3pushauto.sh
