#!/bin/bash

# Script to dynamically merge into another branch

# Check if branch name is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <target-branch>"
    echo "Example: $0 main"
    exit 1
fi

TARGET_BRANCH=$1
CURRENT_BRANCH=$(git branch --show-current)

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check if target branch exists
if ! git show-ref --verify --quiet refs/heads/$TARGET_BRANCH; then
    echo "Error: Branch '$TARGET_BRANCH' does not exist"
    exit 1
fi

# Save current work if there are uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Uncommitted changes detected. Stashing..."
    git stash push -m "Auto-stash before merge to $TARGET_BRANCH"
    STASHED=true
fi

# Switch to target branch
echo "Switching to branch: $TARGET_BRANCH"
git checkout $TARGET_BRANCH

# Pull latest changes
echo "Pulling latest changes..."
git pull origin $TARGET_BRANCH

# Merge the source branch
echo "Merging $CURRENT_BRANCH into $TARGET_BRANCH"
git merge $CURRENT_BRANCH

# Check if merge was successful
if [ $? -eq 0 ]; then
    echo "Merge successful!"
    
    # Push changes
    read -p "Push changes to remote? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin $TARGET_BRANCH
    fi
else
    echo "Merge failed. Please resolve conflicts manually."
    exit 1
fi

# Switch back to original branch
git checkout $CURRENT_BRANCH

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo "Restoring stashed changes..."
    git stash pop
fi

echo "Merge operation completed!"