#!/bin/bash

# Fincafe Docker Management Script
# Usage: ./docker-helper.sh [command]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Commands
cmd_build() {
    print_info "Building Docker image..."
    docker build -t fincafe:latest .
    print_success "Image built successfully!"
}

cmd_up() {
    print_info "Starting services..."
    docker-compose up -d
    print_success "Services started!"
    echo ""
    print_info "Application: http://localhost:3000"
    print_info "Database: localhost:5432"
}

cmd_down() {
    print_info "Stopping services..."
    docker-compose down
    print_success "Services stopped!"
}

cmd_restart() {
    print_info "Restarting services..."
    docker-compose restart
    print_success "Services restarted!"
}

cmd_rebuild() {
    print_info "Rebuilding and restarting services..."
    docker-compose up -d --build
    print_success "Services rebuilt and restarted!"
}

cmd_logs() {
    if [ -z "$2" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$2"
    fi
}

cmd_shell() {
    SERVICE=${2:-app}
    print_info "Opening shell in $SERVICE..."
    docker-compose exec "$SERVICE" sh
}

cmd_db_shell() {
    print_info "Opening PostgreSQL shell..."
    docker-compose exec postgres psql -U fincafe -d fincafe_dev
}

cmd_migrate() {
    print_info "Running database migrations..."
    docker-compose exec app npx prisma migrate deploy
    print_success "Migrations completed!"
}

cmd_seed() {
    print_info "Seeding database..."
    docker-compose exec app npx tsx prisma/seed.ts
    print_success "Database seeded!"
}

cmd_clean() {
    print_warning "This will remove all containers, volumes, and images!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

cmd_status() {
    print_info "Services status:"
    docker-compose ps
}

cmd_help() {
    cat << EOF
Fincafe Docker Helper Script

Usage: ./docker-helper.sh [command]

Commands:
  build       Build Docker image
  up          Start all services
  down        Stop all services
  restart     Restart all services
  rebuild     Rebuild and restart services
  logs        View logs (add service name for specific service)
  shell       Open shell in app container
  db-shell    Open PostgreSQL shell
  migrate     Run database migrations
  seed        Seed database with sample data
  status      Show services status
  clean       Remove all containers, volumes, and images
  help        Show this help message

Examples:
  ./docker-helper.sh up
  ./docker-helper.sh logs app
  ./docker-helper.sh rebuild
  ./docker-helper.sh db-shell

EOF
}

# Main
case "${1:-help}" in
    build)
        cmd_build "$@"
        ;;
    up)
        cmd_up "$@"
        ;;
    down)
        cmd_down "$@"
        ;;
    restart)
        cmd_restart "$@"
        ;;
    rebuild)
        cmd_rebuild "$@"
        ;;
    logs)
        cmd_logs "$@"
        ;;
    shell)
        cmd_shell "$@"
        ;;
    db-shell)
        cmd_db_shell "$@"
        ;;
    migrate)
        cmd_migrate "$@"
        ;;
    seed)
        cmd_seed "$@"
        ;;
    status)
        cmd_status "$@"
        ;;
    clean)
        cmd_clean "$@"
        ;;
    help|*)
        cmd_help
        ;;
esac
