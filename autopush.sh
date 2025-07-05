#!/bin/bash

# 🚀 KataCore Auto Git Push - Enhanced Version
# Improved autopush with better commit messages and validation
# Version: 2.1.0 - Dynamic main branch support

set -euo pipefail

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly PURPLE='\033[0;35m'
readonly NC='\033[0m'

# Functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Banner
show_banner() {
    echo -e "${PURPLE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 KataCore Auto Git Push v2.1                           ║
║                                                                              ║
║    Enhanced version with dynamic main branch and merge support              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS] [COMMIT_MESSAGE]"
    echo
    echo "Options:"
    echo "  --merge         Merge current branch to main/master branch"
    echo "  --main-branch   Specify main branch name (default: auto-detect)"
    echo "  --help, -h      Show this help message"
    echo
    echo "Examples:"
    echo "  $0                                    # Auto-commit and push to current branch"
    echo "  $0 \"feat: add new feature\"           # Commit with custom message"
    echo "  $0 --merge                            # Merge to main branch"
    echo "  $0 --merge \"release v2.0\"            # Merge to main with custom message"
    echo "  $0 --main-branch develop --merge      # Merge to specific branch"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository!"
        exit 1
    fi
}

# Generate smart commit message based on changes
generate_commit_message() {
    local modified_files=$(git diff --name-only | wc -l)
    local staged_files=$(git diff --name-only --cached | wc -l)
    local new_files=$(git status --porcelain | grep "^??" | wc -l)
    local deleted_files=$(git status --porcelain | grep "^.D" | wc -l)
    
    # Get most changed file types
    local changed_extensions=$(git diff --name-only | sed 's/.*\.//' | sort | uniq -c | sort -nr | head -3 | awk '{print $2}' | tr '\n' ' ')
    
    # Determine primary change type
    if [ "$new_files" -gt 0 ] && [ "$modified_files" -gt 0 ]; then
        echo "feat: Add $new_files new files and update $modified_files files"
    elif [ "$new_files" -gt 0 ]; then
        echo "feat: Add $new_files new files ($changed_extensions)"
    elif [ "$deleted_files" -gt 0 ]; then
        echo "refactor: Remove $deleted_files files and update $modified_files files"
    elif [ "$modified_files" -gt 5 ]; then
        echo "refactor: Major updates to $modified_files files ($changed_extensions)"
    elif [ "$modified_files" -gt 0 ]; then
        echo "update: Improve $modified_files files ($changed_extensions)"
    else
        echo "chore: Project maintenance and cleanup"
    fi
}

# Show git status with colors
show_status() {
    echo -e "${BLUE}📊 Repository Status:${NC}"
    echo
    git status --short --branch
    echo
    
    # Show file count summary
    local modified=$(git diff --name-only | wc -l)
    local staged=$(git diff --name-only --cached | wc -l)
    local untracked=$(git status --porcelain | grep "^??" | wc -l)
    
    echo -e "${YELLOW}📋 Summary:${NC}"
    echo "  Modified: $modified files"
    echo "  Staged: $staged files"
    echo "  Untracked: $untracked files"
    
    # Show detected main branch
    local main_branch=$(detect_main_branch)
    echo "  Main branch: $main_branch"
    echo
}

# Detect main branch dynamically
detect_main_branch() {
    local main_branch=""
    
    # Check for common main branch names in order of preference
    local branch_candidates=("main" "master" "develop" "dev")
    
    for branch in "${branch_candidates[@]}"; do
        if git show-ref --verify --quiet "refs/heads/$branch"; then
            main_branch="$branch"
            break
        fi
    done
    
    # If no local branch found, check remote branches
    if [ -z "$main_branch" ]; then
        for branch in "${branch_candidates[@]}"; do
            if git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
                main_branch="$branch"
                info "Found remote branch: origin/$branch"
                break
            fi
        done
    fi
    
    # If still no branch found, check default branch from remote
    if [ -z "$main_branch" ] && git remote | grep -q origin; then
        main_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "")
    fi
    
    # Fallback to 'main' if nothing found
    if [ -z "$main_branch" ]; then
        main_branch="main"
        warning "No main branch detected. Using 'main' as default."
    fi
    
    echo "$main_branch"
}

# Merge to main branch
merge_to_main() {
    local commit_msg="$1"
    local target_branch="$2"
    local current_branch=$(git branch --show-current)
    
    info "Target branch: $target_branch"
    info "Current branch: $current_branch"
    
    # Check if we're already on the target branch
    if [ "$current_branch" = "$target_branch" ]; then
        info "Already on target branch '$target_branch'. Proceeding with regular push."
        return 0
    fi
    
    # Check if target branch exists locally
    if ! git show-ref --verify --quiet "refs/heads/$target_branch"; then
        # Check if it exists remotely
        if git show-ref --verify --quiet "refs/remotes/origin/$target_branch"; then
            info "Target branch '$target_branch' exists remotely. Checking it out..."
            git checkout -b "$target_branch" "origin/$target_branch"
        else
            warning "Target branch '$target_branch' doesn't exist. Creating it..."
            git checkout -b "$target_branch"
            git push -u origin "$target_branch"
        fi
        return 0
    fi
    
    # Commit changes first if there are any
    if ! git diff-index --quiet HEAD -- || [ $(git status --porcelain | wc -l) -ne 0 ]; then
        log "Committing changes on $current_branch..."
        git add .
        git commit -m "$commit_msg"
        
        # Push current branch if remote exists
        if git remote | grep -q origin; then
            git push origin "$current_branch" 2>/dev/null || git push -u origin "$current_branch"
        fi
    fi
    
    # Switch to target branch and merge
    log "Switching to $target_branch branch..."
    git checkout "$target_branch"
    
    # Pull latest changes if remote exists
    if git remote | grep -q origin; then
        log "Pulling latest changes from origin/$target_branch..."
        git pull origin "$target_branch" 2>/dev/null || {
            warning "Could not pull from origin/$target_branch. Continuing without pull."
        }
    fi
    
    # Merge current branch
    log "Merging $current_branch into $target_branch..."
    if git merge "$current_branch" --no-ff -m "Merge branch '$current_branch' into $target_branch"; then
        success "Successfully merged $current_branch into $target_branch"
    else
        error "Merge failed. Please resolve conflicts manually."
        exit 1
    fi
    
    # Push to target branch
    if git remote | grep -q origin; then
        log "Pushing to origin/$target_branch..."
        git push origin "$target_branch"
        success "Successfully pushed to origin/$target_branch"
    fi
    
    # Ask if user wants to delete the feature branch
    if [ "$current_branch" != "$target_branch" ]; then
        echo -e "${YELLOW}🗑️  Delete branch '$current_branch'? [y/N]: ${NC}"
        read -r delete_branch
        
        if [[ $delete_branch =~ ^[Yy]$ ]]; then
            git branch -d "$current_branch" 2>/dev/null || git branch -D "$current_branch"
            if git remote | grep -q origin; then
                git push origin --delete "$current_branch" 2>/dev/null || {
                    warning "Could not delete remote branch $current_branch"
                }
            fi
            success "Deleted branch $current_branch"
        fi
    fi
    
    return 1  # Indicate that we merged to target branch
}

# Main execution
main() {
    show_banner
    
    # Check if we're in a git repository
    check_git_repo
    
    # Parse arguments
    local merge_mode=false
    local commit_msg=""
    local main_branch=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --merge)
                merge_mode=true
                shift
                ;;
            --main-branch)
                main_branch="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                commit_msg="$*"
                break
                ;;
        esac
    done
    
    # Detect main branch if not specified
    if [ -z "$main_branch" ]; then
        main_branch=$(detect_main_branch)
    fi
    
    log "Checking repository status..."
    
    # Show current status
    show_status
    
    # Check for changes
    if git diff-index --quiet HEAD -- && [ $(git status --porcelain | wc -l) -eq 0 ]; then
        if [ "$merge_mode" = true ]; then
            info "No changes to commit, but proceeding with merge to $main_branch..."
        else
            info "No changes to commit. Repository is clean."
            exit 0
        fi
    fi
    
    # Get commit message if not provided
    if [ -z "$commit_msg" ]; then
        if [ "$merge_mode" = true ]; then
            echo -e "${YELLOW}💬 Enter commit message for merge (or press Enter for auto-generated): ${NC}"
        else
            echo -e "${YELLOW}💬 Enter commit message (or press Enter for auto-generated): ${NC}"
        fi
        read -r commit_msg
        
        if [ -z "$commit_msg" ]; then
            commit_msg=$(generate_commit_message)
            info "Auto-generated commit message: $commit_msg"
        fi
    fi
    
    # Show what will be committed
    if ! git diff-index --quiet HEAD -- || [ $(git status --porcelain | wc -l) -ne 0 ]; then
        echo -e "${BLUE}📝 Files to be committed:${NC}"
        git add . --dry-run
        echo
    fi
    
    # Confirm action
    if [ "$merge_mode" = true ]; then
        echo -e "${YELLOW}🤔 Commit and merge to '$main_branch' with message: '$commit_msg'? [Y/n]: ${NC}"
    else
        echo -e "${YELLOW}🤔 Commit with message: '$commit_msg'? [Y/n]: ${NC}"
    fi
    read -r confirm
    
    if [[ ! $confirm =~ ^[Yy]?$ ]] && [ -n "$confirm" ]; then
        warning "Operation cancelled by user"
        exit 0
    fi
    
    # Check if remote exists
    if git remote | grep -q origin; then
        info "Remote 'origin' detected"
    else
        warning "No 'origin' remote found. Working in local mode."
    fi
    
    # Merge to main or regular push
    if [ "$merge_mode" = true ]; then
        merge_to_main "$commit_msg" "$main_branch"
        merged_to_main=$?
    else
        # Regular push to current branch
        log "Adding all changes..."
        git add .
        
        log "Committing changes..."
        git commit -m "$commit_msg"
        
        local current_branch=$(git branch --show-current)
        
        # Push to remote if it exists
        if git remote | grep -q origin; then
            log "Pushing to remote repository (branch: $current_branch)..."
            git push origin "$current_branch" 2>/dev/null || git push -u origin "$current_branch"
            success "Successfully pushed to origin/$current_branch"
        else
            success "Changes committed locally to $current_branch"
        fi
        merged_to_main=0
    fi
    
    # Show final status
    echo
    success "🎉 Auto-push completed successfully!"
    info "Commit: $commit_msg"
    
    if [ "$merged_to_main" -eq 1 ]; then
        info "Branch: $main_branch (merged)"
    else
        info "Branch: $(git branch --show-current)"
    fi
    
    # Show last commit info
    echo -e "${BLUE}📝 Last commit:${NC}"
    git log --oneline -1
}

# Run main function with all arguments
main "$@"