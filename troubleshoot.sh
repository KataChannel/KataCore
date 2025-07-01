#!/bin/bash

# KataCore Deployment Troubleshooter
# Script để chẩn đoán và fix các vấn đề deploy thường gặp

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
debug() { echo -e "${PURPLE}🔍 $1${NC}"; }

# Banner
show_banner() {
    echo -e "${CYAN}"
    echo "🔧 KataCore Deployment Troubleshooter"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking local prerequisites..."
    
    local issues=()
    
    # Check essential tools
    local tools=("ssh" "rsync" "docker" "curl" "openssl" "git")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            issues+=("❌ $tool is not installed")
        else
            success "$tool is available"
        fi
    done
    
    # Check Docker status
    if command -v docker >/dev/null 2>&1; then
        if ! docker ps >/dev/null 2>&1; then
            if ! sudo docker ps >/dev/null 2>&1; then
                issues+=("❌ Docker is not running or accessible")
            else
                warning "Docker requires sudo access"
            fi
        fi
    fi
    
    # Check project structure
    local required_files=("docker-compose.yml" "package.json")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            issues+=("❌ Missing required file: $file")
        else
            success "Found $file"
        fi
    done
    
    local required_dirs=("api" "site")
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            issues+=("❌ Missing required directory: $dir")
        else
            success "Found $dir directory"
        fi
    done
    
    # Report issues
    if [[ ${#issues[@]} -gt 0 ]]; then
        echo ""
        warning "Found ${#issues[@]} issue(s):"
        for issue in "${issues[@]}"; do
            echo "  $issue"
        done
        return 1
    else
        success "All prerequisites satisfied"
        return 0
    fi
}

# Test SSH connection with detailed diagnosis
diagnose_ssh() {
    local host="$1"
    local user="${2:-root}"
    local port="${3:-22}"
    
    if [[ -z "$host" ]]; then
        read -p "Enter server host (IP or domain): " host
        read -p "Enter SSH user [default: root]: " user
        read -p "Enter SSH port [default: 22]: " port
        user="${user:-root}"
        port="${port:-22}"
    fi
    
    log "🔐 Diagnosing SSH connection to $user@$host:$port..."
    
    # Test network connectivity
    info "Testing network connectivity..."
    if timeout 10 nc -z "$host" "$port" 2>/dev/null; then
        success "Port $port is reachable on $host"
    else
        error "Cannot reach $host:$port - check firewall and network"
        return 1
    fi
    
    # Test SSH service
    info "Testing SSH service..."
    local ssh_banner=$(timeout 5 nc "$host" "$port" </dev/null 2>/dev/null | head -1)
    if [[ "$ssh_banner" =~ ^SSH ]]; then
        success "SSH service is running: $ssh_banner"
    else
        warning "SSH service may not be running or responding"
    fi
    
    # Test authentication
    info "Testing SSH authentication..."
    
    # Try key-based auth first
    if ssh -p "$port" -o ConnectTimeout=10 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes "$user@$host" "echo 'AUTH_SUCCESS'" 2>/dev/null | grep -q "AUTH_SUCCESS"; then
        success "SSH key authentication successful"
        return 0
    else
        warning "SSH key authentication failed"
    fi
    
    # Try password auth
    info "Attempting password authentication..."
    if ssh -p "$port" -o ConnectTimeout=10 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$user@$host" "echo 'AUTH_SUCCESS'" 2>/dev/null | grep -q "AUTH_SUCCESS"; then
        success "SSH password authentication successful"
        return 0
    else
        error "SSH authentication failed"
        
        echo ""
        warning "Troubleshooting suggestions:"
        echo "  1. Verify username '$user' exists on the server"
        echo "  2. Check SSH key is added to ~/.ssh/authorized_keys"
        echo "  3. Verify SSH service is running: systemctl status ssh"
        echo "  4. Check SSH configuration: /etc/ssh/sshd_config"
        echo "  5. Review SSH logs: journalctl -u ssh"
        return 1
    fi
}

# Check server requirements
check_server() {
    local host="$1"
    local user="${2:-root}"
    local port="${3:-22}"
    
    if [[ -z "$host" ]]; then
        read -p "Enter server host: " host
        read -p "Enter SSH user [default: root]: " user
        read -p "Enter SSH port [default: 22]: " port
        user="${user:-root}"
        port="${port:-22}"
    fi
    
    log "🖥️  Checking server requirements for $user@$host:$port..."
    
    ssh -p "$port" "$user@$host" << 'SERVER_CHECK_EOF'
        set -e
        
        echo "📊 System Information:"
        echo "  OS: $(lsb_release -d 2>/dev/null | cut -f2 || cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
        echo "  Kernel: $(uname -r)"
        echo "  Architecture: $(uname -m)"
        echo "  Uptime: $(uptime | awk '{print $3,$4}' | sed 's/,//')"
        echo ""
        
        echo "💾 Resources:"
        echo "  Memory: $(free -h | awk '/^Mem:/ {printf "%s/%s (%.1f%% used)", $3, $2, $3/$2*100}')"
        echo "  Disk: $(df -h / | awk 'NR==2 {printf "%s/%s (%s used)", $3, $2, $5}')"
        echo "  Load: $(uptime | awk -F'load average:' '{print $2}' | tr -d ' ')"
        echo ""
        
        echo "🔧 Software Check:"
        
        # Check Docker
        if command -v docker >/dev/null 2>&1; then
            echo "  ✅ Docker: $(docker --version | cut -d' ' -f3 | tr -d ',')"
            echo "    Status: $(systemctl is-active docker 2>/dev/null || echo 'unknown')"
        else
            echo "  ❌ Docker: Not installed"
        fi
        
        # Check Docker Compose
        if docker compose version >/dev/null 2>&1; then
            echo "  ✅ Docker Compose: $(docker compose version --short)"
        elif command -v docker-compose >/dev/null 2>&1; then
            echo "  ✅ Docker Compose: $(docker-compose --version | cut -d' ' -f3 | tr -d ',')"
        else
            echo "  ❌ Docker Compose: Not installed"
        fi
        
        # Check other tools
        for tool in curl wget git openssl; do
            if command -v "$tool" >/dev/null 2>&1; then
                echo "  ✅ $tool: Available"
            else
                echo "  ❌ $tool: Not installed"
            fi
        done
        
        echo ""
        echo "🔥 Firewall Status:"
        if command -v ufw >/dev/null 2>&1; then
            echo "  UFW: $(ufw status | head -1)"
        elif command -v firewall-cmd >/dev/null 2>&1; then
            echo "  firewalld: $(systemctl is-active firewalld 2>/dev/null || echo 'inactive')"
        else
            echo "  No firewall detected"
        fi
        
        echo ""
        echo "🌐 Network:"
        echo "  Public IP: $(curl -s ifconfig.me || echo 'Unable to detect')"
        echo "  Open ports: $(ss -tulpn | grep LISTEN | awk '{print $5}' | cut -d: -f2 | sort -nu | head -10 | tr '\n' ' ')"
        
        echo ""
        echo "📁 Deployment Directory:"
        if [[ -d "/opt/katacore" ]]; then
            echo "  Status: Exists"
            echo "  Size: $(du -sh /opt/katacore 2>/dev/null | cut -f1)"
            if [[ -f "/opt/katacore/docker-compose.prod.yml" ]]; then
                echo "  Previous deployment: Found"
            fi
        else
            echo "  Status: Not found (will be created)"
        fi
SERVER_CHECK_EOF
}

# Fix common issues
fix_issues() {
    local host="$1"
    local user="${2:-root}"
    local port="${3:-22}"
    
    if [[ -z "$host" ]]; then
        read -p "Enter server host: " host
        read -p "Enter SSH user [default: root]: " user
        read -p "Enter SSH port [default: 22]: " port
        user="${user:-root}"
        port="${port:-22}"
    fi
    
    log "🔧 Attempting to fix common deployment issues on $host..."
    
    ssh -p "$port" "$user@$host" << 'FIX_EOF'
        set -e
        
        echo "🔄 Fixing common issues..."
        
        # Fix Docker permissions
        if command -v docker >/dev/null 2>&1; then
            echo "🐳 Fixing Docker permissions..."
            
            # Add current user to docker group
            if ! groups $USER | grep -q docker; then
                sudo usermod -aG docker $USER
                echo "  ✅ Added $USER to docker group"
            fi
            
            # Restart Docker service
            sudo systemctl restart docker
            echo "  ✅ Docker service restarted"
            
            # Clean up Docker
            docker system prune -f 2>/dev/null || true
            echo "  ✅ Docker cleaned up"
        fi
        
        # Fix firewall rules
        echo "🔥 Configuring firewall..."
        if command -v ufw >/dev/null 2>&1; then
            sudo ufw allow ssh >/dev/null 2>&1 || true
            sudo ufw allow 80/tcp >/dev/null 2>&1 || true
            sudo ufw allow 443/tcp >/dev/null 2>&1 || true
            sudo ufw allow 3000/tcp >/dev/null 2>&1 || true
            sudo ufw allow 3001/tcp >/dev/null 2>&1 || true
            echo "  ✅ UFW rules updated"
        elif command -v firewall-cmd >/dev/null 2>&1; then
            sudo firewall-cmd --permanent --add-service=ssh >/dev/null 2>&1 || true
            sudo firewall-cmd --permanent --add-service=http >/dev/null 2>&1 || true
            sudo firewall-cmd --permanent --add-service=https >/dev/null 2>&1 || true
            sudo firewall-cmd --permanent --add-port=3000/tcp >/dev/null 2>&1 || true
            sudo firewall-cmd --permanent --add-port=3001/tcp >/dev/null 2>&1 || true
            sudo firewall-cmd --reload >/dev/null 2>&1 || true
            echo "  ✅ firewalld rules updated"
        fi
        
        # Fix disk space
        echo "💾 Cleaning up disk space..."
        
        # Clean package cache
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get clean >/dev/null 2>&1 || true
            sudo apt-get autoremove -y >/dev/null 2>&1 || true
        elif command -v yum >/dev/null 2>&1; then
            sudo yum clean all >/dev/null 2>&1 || true
        elif command -v dnf >/dev/null 2>&1; then
            sudo dnf clean all >/dev/null 2>&1 || true
        fi
        
        # Clean logs
        sudo journalctl --vacuum-time=7d >/dev/null 2>&1 || true
        
        # Clean tmp files
        sudo find /tmp -type f -atime +7 -delete 2>/dev/null || true
        
        echo "  ✅ System cleanup completed"
        
        # Fix deployment directory permissions
        echo "📁 Fixing deployment directory..."
        sudo mkdir -p /opt/katacore
        sudo chown $USER:$USER /opt/katacore
        sudo chmod 755 /opt/katacore
        echo "  ✅ Deployment directory ready"
        
        echo ""
        echo "✅ Common issues fixed successfully!"
        echo ""
        echo "📊 Updated system status:"
        echo "  Disk space: $(df -h / | awk 'NR==2 {print $4}') available"
        echo "  Memory: $(free -h | awk '/^Mem:/ {print $7}') free"
        echo "  Docker: $(systemctl is-active docker)"
FIX_EOF
    
    success "Issues fixed on $host"
}

# Clean deployment
clean_deployment() {
    local host="$1"
    local user="${2:-root}"
    local port="${3:-22}"
    
    if [[ -z "$host" ]]; then
        read -p "Enter server host: " host
        read -p "Enter SSH user [default: root]: " user
        read -p "Enter SSH port [default: 22]: " port
        user="${user:-root}"
        port="${port:-22}"
    fi
    
    warning "This will remove all KataCore containers and data!"
    read -p "Are you sure? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        info "Operation cancelled"
        return
    fi
    
    log "🧹 Cleaning deployment on $host..."
    
    ssh -p "$port" "$user@$host" << 'CLEAN_EOF'
        set -e
        
        cd /opt/katacore 2>/dev/null || true
        
        echo "🐳 Stopping all containers..."
        if [[ -f "docker-compose.prod.yml" ]]; then
            if docker compose version >/dev/null 2>&1; then
                COMPOSE_CMD="docker compose"
            else
                COMPOSE_CMD="docker-compose"
            fi
            
            $COMPOSE_CMD -f docker-compose.prod.yml down --volumes --remove-orphans 2>/dev/null || true
        fi
        
        echo "🗑️  Removing KataCore containers..."
        docker ps -a | grep -E "(katacore|kata)" | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
        
        echo "🗑️  Removing KataCore images..."
        docker images | grep -E "(katacore|kata)" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
        
        echo "🗑️  Removing unused volumes..."
        docker volume prune -f 2>/dev/null || true
        
        echo "🗑️  Removing unused networks..."
        docker network prune -f 2>/dev/null || true
        
        echo "📁 Cleaning deployment directory..."
        rm -rf /opt/katacore/.deploy-cache
        rm -rf /opt/katacore/logs/*
        
        echo "✅ Cleanup completed!"
CLEAN_EOF
    
    success "Deployment cleaned on $host"
}

# Show deployment logs
show_logs() {
    local host="$1"
    local user="${2:-root}"
    local port="${3:-22}"
    local service="${4:-}"
    
    if [[ -z "$host" ]]; then
        read -p "Enter server host: " host
        read -p "Enter SSH user [default: root]: " user
        read -p "Enter SSH port [default: 22]: " port
        user="${user:-root}"
        port="${port:-22}"
    fi
    
    log "📋 Fetching logs from $host..."
    
    local log_cmd="cd /opt/katacore && "
    if docker compose version >/dev/null 2>&1; then
        log_cmd+="docker compose -f docker-compose.prod.yml logs -f --tail=100"
    else
        log_cmd+="docker-compose -f docker-compose.prod.yml logs -f --tail=100"
    fi
    
    if [[ -n "$service" ]]; then
        log_cmd+=" $service"
    fi
    
    ssh -p "$port" "$user@$host" "$log_cmd"
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [HOST] [USER] [PORT]"
    echo ""
    echo "Commands:"
    echo "  check-local           Check local prerequisites"
    echo "  ssh-test HOST         Test SSH connection"
    echo "  check-server HOST     Check server requirements"
    echo "  fix-issues HOST       Fix common deployment issues"
    echo "  clean HOST            Clean deployment (removes all data)"
    echo "  logs HOST [SERVICE]   Show deployment logs"
    echo "  help                  Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 check-local"
    echo "  $0 ssh-test 192.168.1.100"
    echo "  $0 check-server 192.168.1.100 root 22"
    echo "  $0 fix-issues myserver.com ubuntu"
    echo "  $0 clean 192.168.1.100"
    echo "  $0 logs 192.168.1.100 api"
    echo ""
}

# Main execution
case "${1:-}" in
    "check-local"|"check")
        show_banner
        check_prerequisites
        ;;
    "ssh-test"|"ssh")
        show_banner
        diagnose_ssh "$2" "$3" "$4"
        ;;
    "check-server"|"server")
        show_banner
        check_server "$2" "$3" "$4"
        ;;
    "fix-issues"|"fix")
        show_banner
        fix_issues "$2" "$3" "$4"
        ;;
    "clean")
        show_banner
        clean_deployment "$2" "$3" "$4"
        ;;
    "logs"|"log")
        show_logs "$2" "$3" "$4" "$5"
        ;;
    "help"|"--help"|"-h"|"")
        show_banner
        show_usage
        ;;
    *)
        error "Unknown command: $1. Use '$0 help' for usage information."
        ;;
esac
