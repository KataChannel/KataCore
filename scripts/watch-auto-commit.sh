#!/bin/bash

# Watch mode auto-commit
# Automatically commits changes every X minutes if there are modifications

# Setup Bun PATH if needed
if ! command -v bun &> /dev/null; then
    if [[ -f "$HOME/.bun/bin/bun" ]]; then
        export PATH="$HOME/.bun/bin:$PATH"
        echo "🔧 Added Bun to PATH for this session"
    else
        echo "❌ Error: Bun not found! Please install Bun first."
        echo "💡 Run: curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi
fi

INTERVAL_MINUTES=${1:-10}  # Default 10 minutes
INTERVAL_SECONDS=$((INTERVAL_MINUTES * 60))

echo "👀 Starting auto-commit watch mode..."
echo "⏰ Will check for changes every $INTERVAL_MINUTES minutes"
echo "🛑 Press Ctrl+C to stop"

while true; do
    if [[ -n $(git status --porcelain) ]]; then
        echo "📝 Changes detected, auto-committing..."
        ./scripts/auto-push.sh "Auto-commit from watch mode: $(date '+%Y-%m-%d %H:%M:%S')"
    else
        echo "✅ No changes detected ($(date '+%H:%M:%S'))"
    fi
    
    sleep $INTERVAL_SECONDS
done
