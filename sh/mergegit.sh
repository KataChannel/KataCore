#!/bin/bash

# Script to dynamically merge into another branch

# Function to print colored output
print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

print_step() {
    echo -e "\033[1;36m[STEP]\033[0m $1"
}

# Function to get user confirmation
confirm() {
    read -p "$1 (y/n): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# Function to select branch interactively
select_branch() {
    print_info "Available branches:" >&2
    
    # Get all branches and clean them up
    local branches=($(git branch -a | grep -v HEAD | sed 's/^\*//g' | sed 's/^[[:space:]]*//' | sed 's/remotes\/origin\///' | sort | uniq))
    
    # Display branches with numbers
    for i in "${!branches[@]}"; do
        echo "  $((i+1)). ${branches[i]}" >&2
    done
    
    echo >&2
    read -p "Enter branch number or name: " branch_input
    
    # If input is a number, get the branch name from the array
    if [[ $branch_input =~ ^[0-9]+$ ]]; then
        local index=$((branch_input - 1))
        if [ $index -ge 0 ] && [ $index -lt ${#branches[@]} ]; then
            SELECTED_BRANCH="${branches[$index]}"
        else
            print_error "Invalid branch number"
            return 1
        fi
    else
        # If input is a branch name, validate it exists
        SELECTED_BRANCH="$branch_input"
        local found=false
        for branch in "${branches[@]}"; do
            if [ "$branch" = "$SELECTED_BRANCH" ]; then
                found=true
                break
            fi
        done
        if [ "$found" = false ]; then
            print_error "Branch '$SELECTED_BRANCH' not found in available branches"
            return 1
        fi
    fi
    
    echo "$SELECTED_BRANCH"
}

# Get target branch
print_step "Getting target branch information..."
if [ $# -eq 0 ]; then
    print_warning "No target branch specified."
    if confirm "Do you want to select from available branches?"; then
        TARGET_BRANCH=$(select_branch)
        if [ $? -ne 0 ]; then
            print_error "Failed to select branch"
            exit 1
        fi
    else
        read -p "Enter target branch name: " TARGET_BRANCH
        TARGET_BRANCH=$(echo "$TARGET_BRANCH" | xargs)
    fi
else
    TARGET_BRANCH=$1
    print_info "Target branch: $TARGET_BRANCH"
fi

# Validate target branch
if [ -z "$TARGET_BRANCH" ]; then
    print_error "No target branch specified"
    exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)

# Check if we're in a git repository
print_step "Validating git repository..."
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi
print_success "Git repository validated"

# Check if target branch exists
print_step "Checking if target branch exists..."
if ! git show-ref --verify --quiet refs/heads/$TARGET_BRANCH && ! git show-ref --verify --quiet refs/remotes/origin/$TARGET_BRANCH; then
    print_warning "Branch '$TARGET_BRANCH' does not exist"
    if confirm "Do you want to create this branch?"; then
        print_info "Creating new branch: $TARGET_BRANCH"
        git checkout -b $TARGET_BRANCH
        print_success "Branch '$TARGET_BRANCH' created successfully"
    else
        print_error "Cannot proceed without target branch"
        exit 1
    fi
else
    print_success "Target branch '$TARGET_BRANCH' exists"
fi

echo
print_info "=== MERGE SUMMARY ==="
print_info "Current branch: $CURRENT_BRANCH"
print_info "Target branch: $TARGET_BRANCH"
print_info "Operation: Merge $CURRENT_BRANCH → $TARGET_BRANCH"
echo

if ! confirm "Proceed with merge?"; then
    print_warning "Merge cancelled by user"
    exit 0
fi

# Save current work if there are uncommitted changes
print_step "Checking for uncommitted changes..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    print_warning "Uncommitted changes detected"
    if confirm "Stash changes before merge?"; then
        print_info "Stashing uncommitted changes..."
        git stash push -m "Auto-stash before merge to $TARGET_BRANCH"
        if [ $? -eq 0 ]; then
            print_success "Changes stashed successfully"
            STASHED=true
        else
            print_error "Failed to stash changes"
            exit 1
        fi
    else
        print_error "Please commit or stash your changes first"
        exit 1
    fi
else
    print_success "Working directory clean"
fi

# Switch to target branch
print_step "Switching to target branch: $TARGET_BRANCH"
git checkout $TARGET_BRANCH
if [ $? -eq 0 ]; then
    print_success "Successfully switched to branch: $TARGET_BRANCH"
else
    print_error "Failed to switch to branch: $TARGET_BRANCH"
    exit 1
fi

# Pull latest changes
if confirm "Pull latest changes from remote?"; then
    print_step "Pulling latest changes from remote..."
    git pull origin $TARGET_BRANCH
    if [ $? -eq 0 ]; then
        print_success "Latest changes pulled successfully"
    else
        print_warning "Failed to pull latest changes, continuing with local branch"
    fi
fi

# Merge options
echo
print_info "=== MERGE OPTIONS ==="
echo "1. Regular merge"
echo "2. No-fast-forward merge"
echo "3. Squash merge"
read -p "Select merge type (1-3, default: 1): " merge_type

print_step "Starting merge operation..."
case $merge_type in
    2)
        print_info "Performing no-fast-forward merge: $CURRENT_BRANCH → $TARGET_BRANCH"
        git merge --no-ff $CURRENT_BRANCH
        MERGE_STATUS=$?
        ;;
    3)
        print_info "Performing squash merge: $CURRENT_BRANCH → $TARGET_BRANCH"
        git merge --squash $CURRENT_BRANCH
        MERGE_STATUS=$?
        if [ $MERGE_STATUS -eq 0 ]; then
            print_info "Squash merge completed, creating commit..."
            read -p "Enter commit message for squash merge: " commit_msg
            git commit -m "$commit_msg"
            MERGE_STATUS=$?
        fi
        ;;
    *)
        print_info "Performing regular merge: $CURRENT_BRANCH → $TARGET_BRANCH"
        git merge $CURRENT_BRANCH
        MERGE_STATUS=$?
        ;;
esac

# Check if merge was successful
echo
if [ $MERGE_STATUS -eq 0 ]; then
    print_success "Merge completed successfully!"
    
    # Show merge result
    print_info "Merge statistics:"
    git diff --stat HEAD~1 HEAD 2>/dev/null || echo "  New branch created"
    
    # Push changes
    if confirm "Push changes to remote?"; then
        print_step "Pushing changes to remote..."
        git push origin $TARGET_BRANCH
        if [ $? -eq 0 ]; then
            print_success "Changes pushed to remote successfully"
        else
            print_error "Failed to push changes to remote"
        fi
    fi
else
    print_error "Merge failed - conflicts may need to be resolved"
    print_info "To resolve conflicts:"
    print_info "1. Edit conflicted files"
    print_info "2. Run: git add <resolved-files>"
    print_info "3. Run: git commit"
    exit 1
fi

# Switch back to original branch
echo
if confirm "Switch back to original branch ($CURRENT_BRANCH)?"; then
    print_step "Switching back to original branch: $CURRENT_BRANCH"
    git checkout $CURRENT_BRANCH
    if [ $? -eq 0 ]; then
        print_success "Successfully switched back to: $CURRENT_BRANCH"
    else
        print_error "Failed to switch back to: $CURRENT_BRANCH"
    fi
    
    # Restore stashed changes if any
    if [ "$STASHED" = true ]; then
        if confirm "Restore stashed changes?"; then
            print_step "Restoring stashed changes..."
            git stash pop
            if [ $? -eq 0 ]; then
                print_success "Stashed changes restored successfully"
            else
                print_warning "Failed to restore stashed changes - they remain in stash"
            fi
        fi
    fi
fi

echo
print_success "=== MERGE OPERATION COMPLETED ==="
print_info "Summary:"
print_info "✓ Merged $CURRENT_BRANCH into $TARGET_BRANCH"
print_info "✓ All operations completed successfully"