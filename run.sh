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
    print_color $BLUE "Usage: ./run.sh [command]"
    echo ""
}

# Main script logic
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
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_color $RED "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
