#!/bin/bash

# TazaCore Script Runner
# Quick access to common development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    echo -e "${1}${2}${NC}"
}

# Function to get user input
get_user_input() {
    local prompt="$1"
    local var_name="$2"
    print_color $CYAN "$prompt"
    read -r "$var_name"
}

# Function to confirm action
confirm_action() {
    local message="$1"
    print_color $YELLOW "$message (y/N): "
    read -r confirmation
    case $confirmation in
        [yY]|[yY][eE][sS]) return 0 ;;
        *) return 1 ;;
    esac
}

# Function to show help
show_help() {
    print_color $CYAN "🚀 TazaCore Development Helper"
    echo "=================================="
    echo ""
    print_color $YELLOW "Quick Commands:"
    echo "  fresh        - Complete fresh setup"
    echo "  dev          - Start development servers"
    echo "  build        - Build for production"
    echo "  test         - Run all tests"
    echo "  lint         - Check code quality"
    echo "  db           - Database operations"
    echo "  docker       - Docker operations"
    echo "  git          - Git operations"
    echo "  deploy       - Deployment operations"
    echo "  clean        - Clean build artifacts"
    echo ""
    print_color $YELLOW "Database Commands:"
    echo "  db:migrate   - Run migrations"
    echo "  db:seed      - Seed database"
    echo "  db:studio    - Open Prisma Studio"
    echo "  db:reset     - Reset database"
    echo ""
    print_color $YELLOW "Docker Commands:"
    echo "  docker:up    - Start containers"
    echo "  docker:down  - Stop containers"
    echo "  docker:logs  - View logs"
    echo ""
    print_color $YELLOW "Git Commands:"
    echo "  git:status   - Show status"
    echo "  git:add      - Add changes"
    echo "  git:commit   - Commit changes"
    echo "  git:push     - Push to remote"
    echo "  git:pull     - Pull from remote"
    echo "  git:branch   - Branch operations"
    echo ""
    print_color $BLUE "Usage: ./run.sh [command] or run interactively"
    echo ""
}

# Interactive menu
interactive_menu() {
    while true; do
        echo ""
        print_color $CYAN "🚀 TazaCore Interactive Menu"
        echo "=============================="
        echo "1) Fresh setup"
        echo "2) Start development"
        echo "3) Build production"
        echo "4) Run tests"
        echo "5) Check code quality"
        echo "6) Database operations"
        echo "7) Docker operations"
        echo "8) Git operations"
        echo "9) Deploy"
        echo "10) Clean artifacts"
        echo "11) Health check"
        echo "0) Exit"
        echo ""
        
        get_user_input "Select an option (0-11):" choice
        
        case $choice in
            1)
                if confirm_action "Start fresh setup?"; then
                    print_color $GREEN "🔄 Setting up fresh environment..."
                    bun run fresh
                fi
                ;;
            2)
                print_color $GREEN "🚀 Starting development servers..."
                bun run dev
                ;;
            3)
                if confirm_action "Build for production?"; then
                    print_color $GREEN "🏗️ Building for production..."
                    bun run build
                fi
                ;;
            4)
                print_color $GREEN "🧪 Running tests..."
                bun run test
                ;;
            5)
                print_color $GREEN "🔍 Checking code quality..."
                bun run lint
                ;;
            6)
                database_menu
                ;;
            7)
                docker_menu
                ;;
            8)
                git_menu
                ;;
            9)
                deploy_menu
                ;;
            10)
                if confirm_action "Clean build artifacts?"; then
                    print_color $GREEN "🧹 Cleaning build artifacts..."
                    bun run clean
                fi
                ;;
            11)
                print_color $GREEN "🏥 Checking application health..."
                bun run health
                ;;
            0)
                print_color $GREEN "👋 Goodbye!"
                exit 0
                ;;
            *)
                print_color $RED "❌ Invalid option. Please try again."
                ;;
        esac
    done
}

# Database submenu
database_menu() {
    echo ""
    print_color $CYAN "📊 Database Operations"
    echo "======================"
    echo "1) Run migrations"
    echo "2) Seed database"
    echo "3) Open Prisma Studio"
    echo "4) Reset database"
    echo "0) Back to main menu"
    echo ""
    
    get_user_input "Select database option (0-4):" db_choice
    
    case $db_choice in
        1)
            print_color $GREEN "📊 Running database migrations..."
            bun run db:migrate
            ;;
        2)
            print_color $GREEN "🌱 Seeding database..."
            bun run db:seed
            ;;
        3)
            print_color $GREEN "🎨 Opening Prisma Studio..."
            bun run db:studio
            ;;
        4)
            if confirm_action "⚠️ Reset database? This will delete all data!"; then
                print_color $YELLOW "⚠️ Resetting database..."
                bun run db:migrate:reset
            fi
            ;;
        0)
            return
            ;;
        *)
            print_color $RED "❌ Invalid option."
            ;;
    esac
}

# Docker submenu
docker_menu() {
    echo ""
    print_color $CYAN "🐳 Docker Operations"
    echo "===================="
    echo "1) Start containers"
    echo "2) Stop containers"
    echo "3) View logs"
    echo "0) Back to main menu"
    echo ""
    
    get_user_input "Select docker option (0-3):" docker_choice
    
    case $docker_choice in
        1)
            print_color $GREEN "🐳 Starting Docker containers..."
            bun run docker:up
            ;;
        2)
            print_color $GREEN "🛑 Stopping Docker containers..."
            bun run docker:down
            ;;
        3)
            print_color $GREEN "📋 Viewing Docker logs..."
            bun run docker:logs
            ;;
        0)
            return
            ;;
        *)
            print_color $RED "❌ Invalid option."
            ;;
    esac
}

# Git submenu
git_menu() {
    echo ""
    print_color $CYAN "🔧 Git Operations"
    echo "=================="
    echo "1) Show status"
    echo "2) Add all changes"
    echo "3) Commit changes"
    echo "4) Push to remote"
    echo "5) Pull from remote"
    echo "6) Branch operations"
    echo "7) Quick commit (add + commit + push)"
    echo "0) Back to main menu"
    echo ""
    
    get_user_input "Select git option (0-7):" git_choice
    
    case $git_choice in
        1)
            print_color $GREEN "📊 Checking git status..."
            git status
            ;;
        2)
            print_color $GREEN "➕ Adding all changes..."
            git add .
            git status
            ;;
        3)
            get_user_input "Enter commit message:" commit_msg
            if [ -n "$commit_msg" ]; then
                print_color $GREEN "💾 Committing changes..."
                git commit -m "$commit_msg"
            else
                print_color $RED "❌ Commit message required."
            fi
            ;;
        4)
            print_color $GREEN "🚀 Pushing to remote..."
            git push
            ;;
        5)
            print_color $GREEN "⬇️ Pulling from remote..."
            git pull
            ;;
        6)
            git_branch_menu
            ;;
        7)
            get_user_input "Enter commit message:" commit_msg
            if [ -n "$commit_msg" ]; then
                print_color $GREEN "🚀 Quick commit: add + commit + push..."
                git add .
                git commit -m "$commit_msg"
                git push
            else
                print_color $RED "❌ Commit message required."
            fi
            ;;
        0)
            return
            ;;
        *)
            print_color $RED "❌ Invalid option."
            ;;
    esac
}

# Git branch submenu
git_branch_menu() {
    echo ""
    print_color $CYAN "🌿 Branch Operations"
    echo "===================="
    echo "1) List branches"
    echo "2) Create new branch"
    echo "3) Switch branch"
    echo "4) Delete branch"
    echo "5) Merge branch"
    echo "0) Back to git menu"
    echo ""
    
    get_user_input "Select branch option (0-5):" branch_choice
    
    case $branch_choice in
        1)
            print_color $GREEN "📋 Listing branches..."
            git branch -a
            ;;
        2)
            get_user_input "Enter new branch name:" branch_name
            if [ -n "$branch_name" ]; then
                print_color $GREEN "🌿 Creating and switching to branch: $branch_name"
                git checkout -b "$branch_name"
            else
                print_color $RED "❌ Branch name required."
            fi
            ;;
        3)
            get_user_input "Enter branch name to switch to:" branch_name
            if [ -n "$branch_name" ]; then
                print_color $GREEN "🔄 Switching to branch: $branch_name"
                git checkout "$branch_name"
            else
                print_color $RED "❌ Branch name required."
            fi
            ;;
        4)
            get_user_input "Enter branch name to delete:" branch_name
            if [ -n "$branch_name" ]; then
                if confirm_action "Delete branch '$branch_name'?"; then
                    print_color $GREEN "🗑️ Deleting branch: $branch_name"
                    git branch -d "$branch_name"
                fi
            else
                print_color $RED "❌ Branch name required."
            fi
            ;;
        5)
            get_user_input "Enter branch name to merge:" branch_name
            if [ -n "$branch_name" ]; then
                if confirm_action "Merge branch '$branch_name' into current branch?"; then
                    print_color $GREEN "🔀 Merging branch: $branch_name"
                    git merge "$branch_name"
                fi
            else
                print_color $RED "❌ Branch name required."
            fi
            ;;
        0)
            return
            ;;
        *)
            print_color $RED "❌ Invalid option."
            ;;
    esac
}

# Deploy submenu
deploy_menu() {
    echo ""
    print_color $CYAN "🚀 Deployment Options"
    echo "====================="
    echo "1) Deploy to staging"
    echo "2) Deploy to production"
    echo "3) Deployment wizard"
    echo "0) Back to main menu"
    echo ""
    
    get_user_input "Select deployment option (0-3):" deploy_choice
    
    case $deploy_choice in
        1)
            if confirm_action "Deploy to staging?"; then
                print_color $GREEN "🚀 Deploying to staging..."
                bun run deploy:staging
            fi
            ;;
        2)
            if confirm_action "⚠️ Deploy to production? This is a critical operation!"; then
                print_color $YELLOW "⚠️ Deploying to production..."
                bun run deploy:production
            fi
            ;;
        3)
            print_color $GREEN "🚀 Running deployment wizard..."
            bun run deploy:wizard
            ;;
        0)
            return
            ;;
        *)
            print_color $RED "❌ Invalid option."
            ;;
    esac
}

# Main script logic
if [ $# -eq 0 ]; then
    interactive_menu
else
    case $1 in
        "fresh")
            print_color $GREEN "🔄 Setting up fresh environment..."
            bun run fresh
            ;;
        "dev")
            print_color $GREEN "🚀 Starting development servers..."
            bun run dev
            ;;
        "build")
            print_color $GREEN "🏗️ Building for production..."
            bun run build
            ;;
        "test")
            print_color $GREEN "🧪 Running tests..."
            bun run test
            ;;
        "lint")
            print_color $GREEN "🔍 Checking code quality..."
            bun run lint
            ;;
        "db")
            case $2 in
                "migrate")
                    print_color $GREEN "📊 Running database migrations..."
                    bun run db:migrate
                    ;;
                "seed")
                    print_color $GREEN "🌱 Seeding database..."
                    bun run db:seed
                    ;;
                "studio")
                    print_color $GREEN "🎨 Opening Prisma Studio..."
                    bun run db:studio
                    ;;
                "reset")
                    print_color $YELLOW "⚠️ Resetting database..."
                    bun run db:migrate:reset
                    ;;
                *)
                    print_color $RED "❌ Unknown database command: $2"
                    echo "Available: migrate, seed, studio, reset"
                    ;;
            esac
            ;;
        "docker")
            case $2 in
                "up")
                    print_color $GREEN "🐳 Starting Docker containers..."
                    bun run docker:up
                    ;;
                "down")
                    print_color $GREEN "🛑 Stopping Docker containers..."
                    bun run docker:down
                    ;;
                "logs")
                    print_color $GREEN "📋 Viewing Docker logs..."
                    bun run docker:logs
                    ;;
                *)
                    print_color $RED "❌ Unknown docker command: $2"
                    echo "Available: up, down, logs"
                    ;;
            esac
            ;;
        "git")
            case $2 in
                "status")
                    print_color $GREEN "📊 Checking git status..."
                    git status
                    ;;
                "add")
                    print_color $GREEN "➕ Adding all changes..."
                    git add .
                    ;;
                "commit")
                    if [ -n "$3" ]; then
                        print_color $GREEN "💾 Committing changes..."
                        git commit -m "$3"
                    else
                        print_color $RED "❌ Commit message required: ./run.sh git commit \"message\""
                    fi
                    ;;
                "push")
                    print_color $GREEN "🚀 Pushing to remote..."
                    git push
                    ;;
                "pull")
                    print_color $GREEN "⬇️ Pulling from remote..."
                    git pull
                    ;;
                *)
                    print_color $RED "❌ Unknown git command: $2"
                    echo "Available: status, add, commit, push, pull"
                    ;;
            esac
            ;;
        "deploy")
            case $2 in
                "staging")
                    print_color $GREEN "🚀 Deploying to staging..."
                    bun run deploy:staging
                    ;;
                "production")
                    print_color $YELLOW "⚠️ Deploying to production..."
                    bun run deploy:production
                    ;;
                *)
                    print_color $GREEN "🚀 Running deployment wizard..."
                    bun run deploy:wizard
                    ;;
            esac
            ;;
        "clean")
            print_color $GREEN "🧹 Cleaning build artifacts..."
            bun run clean
            ;;
        "health")
            print_color $GREEN "🏥 Checking application health..."
            bun run health
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_color $RED "❌ Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
fi
