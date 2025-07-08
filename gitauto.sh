#!/bin/bash

# Git automation script with enhanced UI and detailed notifications
# Author: GitHub Copilot

# Colors for better UI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function show_header() {
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    ${YELLOW}GIT AUTOMATION TOOL${CYAN}                    ║${NC}"
    echo -e "${CYAN}║                     ${GREEN}Version 2.1${CYAN}                         ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Show current git status
    if git rev-parse --git-dir > /dev/null 2>&1; then
        current_branch=$(git branch --show-current)
        repo_name=$(basename $(git rev-parse --show-toplevel))
        echo -e "${BLUE}📁 Repository:${NC} ${GREEN}$repo_name${NC}"
        echo -e "${BLUE}🌿 Current Branch:${NC} ${GREEN}$current_branch${NC}"
        
        # Show pending changes
        if ! git diff-index --quiet HEAD --; then
            echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
        else
            echo -e "${GREEN}✅ Working directory clean${NC}"
        fi
        echo ""
    else
        echo -e "${RED}❌ Not a git repository${NC}"
        echo ""
    fi
}

function show_menu() {
    echo -e "${PURPLE}┌─────────────────────────────────────────────────────────┐${NC}"
    echo -e "${PURPLE}│                     MAIN MENU                          │${NC}"
    echo -e "${PURPLE}├─────────────────────────────────────────────────────────┤${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}1.${NC} 📁 Add files to staging                         ${PURPLE}│${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}2.${NC} 🚀 Commit and Push changes                     ${PURPLE}│${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}3.${NC} ⬇️  Pull from remote repository                 ${PURPLE}│${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}4.${NC} 🗑️  Remove files from tracking                  ${PURPLE}│${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}5.${NC} 🌿 Create and switch to new branch             ${PURPLE}│${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}6.${NC} 🔀 Merge branch into current                   ${PURPLE}│${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}7.${NC} 🔄 Merge current into branch                   ${PURPLE}│${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}8.${NC} 📋 List all branches                           ${PURPLE}│${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}9.${NC} 🗑️  Remove branch (local/remote)               ${PURPLE}│${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}10.${NC} 📊 Show repository status                     ${PURPLE}│${NC}"
    echo -e "${PURPLE}│${NC} ${CYAN}11.${NC} 🚪 Exit application                           ${PURPLE}│${NC}"
    echo -e "${PURPLE}└─────────────────────────────────────────────────────────┘${NC}"
}

function git_add() {
    echo -e "${BLUE}📁 ADD FILES TO STAGING${NC}"
    echo -e "${YELLOW}─────────────────────${NC}"
    
    echo -e "${CYAN}💡 Enter file/directory to add:${NC}"
    echo -e "${YELLOW}   • Use '.' for all files${NC}"
    echo -e "${YELLOW}   • Use specific file names (e.g., file.txt)${NC}"
    echo -e "${YELLOW}   • Use wildcards (e.g., *.js)${NC}"
    echo ""
    echo -n "➤ "
    read -r files
    
    if [ -z "$files" ]; then
        echo -e "${RED}❌ No files specified!${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🔄 Adding files to staging area...${NC}"
    if git add "$files" 2>/dev/null; then
        echo -e "${GREEN}✅ Files added successfully!${NC}"
        echo -e "${BLUE}📋 Staged files:${NC}"
        git diff --cached --name-only | sed 's/^/   ✓ /'
    else
        echo -e "${RED}❌ Failed to add files. Please check file paths.${NC}"
    fi
}

function git_push() {
    echo -e "${BLUE}🚀 COMMIT AND PUSH CHANGES${NC}"
    echo -e "${YELLOW}──────────────────────────${NC}"
    
    # Check if there are staged changes
    if git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  No staged changes found. Stage files first.${NC}"
        return 1
    fi
    
    # Generate default commit message with timestamp
    default_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    
    echo -e "${CYAN}💬 Enter commit message (press Enter for default):${NC}"
    echo -e "${YELLOW}   Default: $default_message${NC}"
    echo -n "➤ "
    read -r message
    
    # Use default message if user input is empty
    if [ -z "$message" ]; then
        message="$default_message"
        echo -e "${BLUE}💡 Using default commit message: $message${NC}"
    fi
    
    echo -e "${YELLOW}🔄 Creating commit...${NC}"
    if git commit -m "$message"; then
        echo -e "${GREEN}✅ Commit created successfully!${NC}"
        
        echo -e "${CYAN}🌐 Enter branch name to push (press Enter for current branch):${NC}"
        echo -n "➤ "
        read -r branch
        
        echo -e "${YELLOW}🔄 Pushing to remote repository...${NC}"
        if [ -z "$branch" ]; then
            if git push; then
                echo -e "${GREEN}✅ Push completed successfully!${NC}"
            else
                echo -e "${RED}❌ Push failed. Check your network connection and permissions.${NC}"
            fi
        else
            if git push origin "$branch"; then
                echo -e "${GREEN}✅ Push to branch '$branch' completed successfully!${NC}"
            else
                echo -e "${RED}❌ Push failed. Check branch name and permissions.${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Commit failed. Please check your changes.${NC}"
    fi
}



function git_pull() {
    echo -e "${BLUE}⬇️  PULL FROM REMOTE REPOSITORY${NC}"
    echo -e "${YELLOW}───────────────────────────────${NC}"
    
    echo -e "${CYAN}🌐 Enter branch to pull from (press Enter for current branch):${NC}"
    echo -n "➤ "
    read -r branch
    
    echo -e "${YELLOW}🔄 Pulling changes from remote...${NC}"
    if [ -z "$branch" ]; then
        if git pull; then
            echo -e "${GREEN}✅ Pull completed successfully!${NC}"
        else
            echo -e "${RED}❌ Pull failed. Check your network connection.${NC}"
        fi
    else
        if git pull origin "$branch"; then
            echo -e "${GREEN}✅ Pull from branch '$branch' completed successfully!${NC}"
        else
            echo -e "${RED}❌ Pull failed. Check branch name and network connection.${NC}"
        fi
    fi
}

function git_remove() {
    echo -e "${BLUE}🗑️  REMOVE FILES FROM TRACKING${NC}"
    echo -e "${YELLOW}──────────────────────────────${NC}"
    
    echo -e "${CYAN}📂 Enter file/directory to remove:${NC}"
    echo -n "➤ "
    read -r files
    
    if [ -z "$files" ]; then
        echo -e "${RED}❌ No files specified!${NC}"
        return 1
    fi
    
    echo -e "${CYAN}🔧 Choose removal type:${NC}"
    echo -e "${YELLOW}   1) Remove from git only (keep local files)${NC}"
    echo -e "${YELLOW}   2) Delete completely (remove files)${NC}"
    echo -n "➤ "
    read -r choice
    
    case $choice in
        1)
            echo -e "${YELLOW}🔄 Removing from git tracking...${NC}"
            if git rm --cached "$files"; then
                echo -e "${GREEN}✅ Files removed from git tracking!${NC}"
                echo -e "${BLUE}💡 Files still exist locally${NC}"
            else
                echo -e "${RED}❌ Failed to remove files from tracking.${NC}"
            fi
            ;;
        2)
            echo -e "${RED}⚠️  This will permanently delete files!${NC}"
            echo -e "${CYAN}Are you sure? (y/N):${NC}"
            echo -n "➤ "
            read -r confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}🔄 Deleting files completely...${NC}"
                if git rm "$files"; then
                    echo -e "${GREEN}✅ Files removed completely!${NC}"
                else
                    echo -e "${RED}❌ Failed to delete files.${NC}"
                fi
            else
                echo -e "${BLUE}💡 Operation cancelled.${NC}"
            fi
            ;;
        *)
            echo -e "${RED}❌ Invalid choice!${NC}"
            ;;
    esac
}

function create_branch() {
    echo -e "${BLUE}🌿 CREATE AND SWITCH TO NEW BRANCH${NC}"
    echo -e "${YELLOW}──────────────────────────────────${NC}"
    
    echo -e "${CYAN}🏷️  Enter new branch name:${NC}"
    echo -n "➤ "
    read -r branch_name
    
    if [ -z "$branch_name" ]; then
        echo -e "${RED}❌ Branch name cannot be empty!${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🔄 Creating and switching to branch '$branch_name'...${NC}"
    if git checkout -b "$branch_name"; then
        echo -e "${GREEN}✅ Branch '$branch_name' created and switched to successfully!${NC}"
        echo -e "${BLUE}🌿 You are now on branch: $branch_name${NC}"
    else
        echo -e "${RED}❌ Failed to create branch. Branch may already exist.${NC}"
    fi
}

function merge_branch() {
    echo -e "${BLUE}🔀 MERGE BRANCH INTO CURRENT${NC}"
    echo -e "${YELLOW}───────────────────────────${NC}"
    
    echo -e "${CYAN}📋 Available branches:${NC}"
    git branch | sed 's/^/   /'
    echo ""
    
    current_branch=$(git branch --show-current)
    echo -e "${BLUE}📍 Current branch: $current_branch${NC}"
    
    echo -e "${CYAN}🔀 Enter branch name to merge into current branch:${NC}"
    echo -n "➤ "
    read -r branch_name
    
    if [ -z "$branch_name" ]; then
        echo -e "${RED}❌ Branch name cannot be empty!${NC}"
        return 1
    fi
    
    if [ "$branch_name" = "$current_branch" ]; then
        echo -e "${RED}❌ Cannot merge branch into itself!${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🔄 Merging branch '$branch_name' into '$current_branch'...${NC}"
    if git merge "$branch_name"; then
        echo -e "${GREEN}✅ Merge completed successfully!${NC}"
    else
        echo -e "${RED}❌ Merge failed. Please resolve conflicts manually.${NC}"
    fi
}

function merge_current_into_branch() {
    echo -e "${BLUE}🔄 MERGE CURRENT INTO BRANCH${NC}"
    echo -e "${YELLOW}───────────────────────────${NC}"
    
    current_branch=$(git branch --show-current)
    echo -e "${BLUE}📍 Current branch: $current_branch${NC}"
    echo ""
    
    echo -e "${CYAN}📋 Available branches:${NC}"
    git branch | grep -v "^*" | sed 's/^/   /'
    echo ""
    
    echo -e "${CYAN}🔄 Enter target branch to merge current branch into:${NC}"
    echo -n "➤ "
    read -r target_branch
    
    if [ -z "$target_branch" ]; then
        echo -e "${RED}❌ Target branch name cannot be empty!${NC}"
        return 1
    fi
    
    if [ "$target_branch" = "$current_branch" ]; then
        echo -e "${RED}❌ Cannot merge branch into itself!${NC}"
        return 1
    fi
    
    # Check if target branch exists
    if ! git show-ref --verify --quiet refs/heads/"$target_branch"; then
        echo -e "${RED}❌ Target branch '$target_branch' does not exist!${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}⚠️  This will switch to '$target_branch' and merge '$current_branch' into it.${NC}"
    echo -e "${CYAN}Do you want to continue? (y/N):${NC}"
    echo -n "➤ "
    read -r confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}💡 Operation cancelled.${NC}"
        return 0
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        echo -e "${RED}❌ You have uncommitted changes! Please commit or stash them first.${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🔄 Switching to branch '$target_branch'...${NC}"
    if git checkout "$target_branch"; then
        echo -e "${GREEN}✅ Switched to branch '$target_branch'${NC}"
        
        echo -e "${YELLOW}🔄 Merging '$current_branch' into '$target_branch'...${NC}"
        if git merge "$current_branch"; then
            echo -e "${GREEN}✅ Successfully merged '$current_branch' into '$target_branch'!${NC}"
            echo -e "${BLUE}🌿 You are now on branch: $target_branch${NC}"
            
            echo -e "${CYAN}🔄 Do you want to switch back to '$current_branch'? (y/N):${NC}"
            echo -n "➤ "
            read -r switch_back
            
            if [[ $switch_back =~ ^[Yy]$ ]]; then
                if git checkout "$current_branch"; then
                    echo -e "${GREEN}✅ Switched back to branch '$current_branch'${NC}"
                else
                    echo -e "${RED}❌ Failed to switch back to '$current_branch'${NC}"
                fi
            fi
        else
            echo -e "${RED}❌ Merge failed. Please resolve conflicts manually.${NC}"
            echo -e "${BLUE}💡 You are currently on branch '$target_branch'${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to switch to branch '$target_branch'${NC}"
    fi
}

function list_branches() {
    echo -e "${BLUE}📋 BRANCH INFORMATION${NC}"
    echo -e "${YELLOW}─────────────────────${NC}"
    
    echo -e "${CYAN}🏠 Local branches:${NC}"
    git branch | sed 's/^/   /'
    echo ""
    
    echo -e "${CYAN}🌐 Remote branches:${NC}"
    git branch -r | sed 's/^/   /'
}

function remove_branch() {
    echo -e "${BLUE}🗑️  REMOVE BRANCH (LOCAL/REMOTE)${NC}"
    echo -e "${YELLOW}─────────────────────────────────${NC}"
    
    current_branch=$(git branch --show-current)
    echo -e "${BLUE}📍 Current branch: $current_branch${NC}"
    echo ""
    
    echo -e "${CYAN}📋 Available local branches:${NC}"
    git branch | grep -v "^*" | sed 's/^/   /'
    echo ""
    
    echo -e "${CYAN}🌐 Available remote branches:${NC}"
    git branch -r | sed 's/^/   /'
    echo ""
    
    echo -e "${CYAN}🔧 Choose removal type:${NC}"
    echo -e "${YELLOW}   1) Remove local branch only${NC}"
    echo -e "${YELLOW}   2) Remove remote branch only${NC}"
    echo -e "${YELLOW}   3) Remove both local and remote branch${NC}"
    echo -n "➤ "
    read -r choice
    
    echo -e "${CYAN}🏷️  Enter branch name to remove:${NC}"
    echo -n "➤ "
    read -r branch_name
    
    if [ -z "$branch_name" ]; then
        echo -e "${RED}❌ Branch name cannot be empty!${NC}"
        return 1
    fi
    
    if [ "$branch_name" = "$current_branch" ]; then
        echo -e "${RED}❌ Cannot remove current branch! Switch to another branch first.${NC}"
        return 1
    fi
    
    case $choice in
        1)
            echo -e "${RED}⚠️  This will permanently delete the local branch '$branch_name'!${NC}"
            echo -e "${CYAN}Are you sure? (y/N):${NC}"
            echo -n "➤ "
            read -r confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}🔄 Removing local branch '$branch_name'...${NC}"
                if git branch -D "$branch_name"; then
                    echo -e "${GREEN}✅ Local branch '$branch_name' removed successfully!${NC}"
                else
                    echo -e "${RED}❌ Failed to remove local branch. Branch may not exist.${NC}"
                fi
            else
                echo -e "${BLUE}💡 Operation cancelled.${NC}"
            fi
            ;;
        2)
            echo -e "${RED}⚠️  This will permanently delete the remote branch '$branch_name'!${NC}"
            echo -e "${CYAN}Are you sure? (y/N):${NC}"
            echo -n "➤ "
            read -r confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}🔄 Removing remote branch '$branch_name'...${NC}"
                if git push origin --delete "$branch_name"; then
                    echo -e "${GREEN}✅ Remote branch '$branch_name' removed successfully!${NC}"
                else
                    echo -e "${RED}❌ Failed to remove remote branch. Branch may not exist or check permissions.${NC}"
                fi
            else
                echo -e "${BLUE}💡 Operation cancelled.${NC}"
            fi
            ;;
        3)
            echo -e "${RED}⚠️  This will permanently delete both local and remote branch '$branch_name'!${NC}"
            echo -e "${CYAN}Are you sure? (y/N):${NC}"
            echo -n "➤ "
            read -r confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}🔄 Removing local branch '$branch_name'...${NC}"
                local_success=false
                remote_success=false
                
                if git branch -D "$branch_name"; then
                    echo -e "${GREEN}✅ Local branch '$branch_name' removed successfully!${NC}"
                    local_success=true
                else
                    echo -e "${RED}❌ Failed to remove local branch.${NC}"
                fi
                
                echo -e "${YELLOW}🔄 Removing remote branch '$branch_name'...${NC}"
                if git push origin --delete "$branch_name"; then
                    echo -e "${GREEN}✅ Remote branch '$branch_name' removed successfully!${NC}"
                    remote_success=true
                else
                    echo -e "${RED}❌ Failed to remove remote branch.${NC}"
                fi
                
                if [ "$local_success" = true ] && [ "$remote_success" = true ]; then
                    echo -e "${GREEN}✅ Both local and remote branches removed successfully!${NC}"
                fi
            else
                echo -e "${BLUE}💡 Operation cancelled.${NC}"
            fi
            ;;
        *)
            echo -e "${RED}❌ Invalid choice!${NC}"
            ;;
    esac
}

function show_status() {
    echo -e "${BLUE}📊 REPOSITORY STATUS${NC}"
    echo -e "${YELLOW}───────────────────${NC}"
    
    echo -e "${CYAN}📁 Repository information:${NC}"
    echo -e "   Repository: $(basename $(git rev-parse --show-toplevel) 2>/dev/null || echo 'Not a git repo')"
    echo -e "   Current branch: $(git branch --show-current 2>/dev/null || echo 'None')"
    echo -e "   Remote URL: $(git remote get-url origin 2>/dev/null || echo 'No remote')"
    echo ""
    
    echo -e "${CYAN}📋 Working directory status:${NC}"
    git status --short | sed 's/^/   /' || echo "   No changes"
    echo ""
    
    echo -e "${CYAN}📝 Recent commits:${NC}"
    git log --oneline -5 | sed 's/^/   /' 2>/dev/null || echo "   No commits"
}

# Main script
while true; do
    show_header
    show_menu
    echo ""
    echo -e "${CYAN}Choose an option (1-11):${NC}"
    echo -n "➤ "
    read -r choice
    
    echo ""
    case $choice in
        1)
            git_add
            ;;
        2)
            git_push
            ;;
        3)
            git_pull
            ;;
        4)
            git_remove
            ;;
        5)
            create_branch
            ;;
        6)
            merge_branch
            ;;
        7)
            merge_current_into_branch
            ;;
        8)
            list_branches
            ;;
        9)
            remove_branch
            ;;
        10)
            show_status
            ;;
        11)
            echo -e "${GREEN}👋 Goodbye! Thank you for using Git Automation Tool!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option! Please choose 1-11.${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read -r
done