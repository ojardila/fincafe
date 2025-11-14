# Docker Setup Guide for Fincafe

This guide explains how to build and run the Fincafe application using Docker.

## Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Compose installed (included with Docker Desktop)

## Quick Start

### 1. Environment Setup

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration values.

### 2. Build and Run with Docker Compose

Start all services (PostgreSQL + Application):

```bash
docker-compose up -d
```

This will:
- Build the Next.js application
- Start PostgreSQL database
- Run database migrations
- Start the application on port 3000

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Docker Commands

### Build the application image only

```bash
docker build -t fincafe:latest .
```

### Start services

```bash
docker-compose up -d
```

### Stop services

```bash
docker-compose down
```

### View logs

```bash
# All services
docker-compose logs -f

# Application only
docker-compose logs -f app

# Database only
docker-compose logs -f postgres
```

### Restart services

```bash
docker-compose restart
```

### Rebuild after code changes

```bash
docker-compose up -d --build
```

### Stop and remove volumes (WARNING: This deletes database data)

```bash
docker-compose down -v
```

## Database Management

### Run Prisma migrations

```bash
# Inside the container
docker-compose exec app npx prisma migrate deploy

# From host (requires node_modules)
npx prisma migrate deploy
```

### Access PostgreSQL

```bash
docker-compose exec postgres psql -U fincafe -d fincafe_dev
```

### Seed the database

```bash
docker-compose exec app npx tsx prisma/seed.ts
```

## Development with Docker

For development, you might want to use Docker only for PostgreSQL and run Next.js locally:

### Start only PostgreSQL

```bash
docker-compose up -d postgres
```

### Run Next.js locally

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx nx serve fincafe
```

## Production Deployment

### Build production image

```bash
docker build -t fincafe:v1.0.0 .
```

### Environment Variables for Production

Make sure to set these environment variables:

- `DATABASE_URL`: Your production PostgreSQL connection string
- `NEXTAUTH_SECRET`: Strong random secret for NextAuth
- `NEXTAUTH_URL`: Your production domain URL
- `NODE_ENV=production`

### Run production container

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e NEXTAUTH_SECRET="your-secret" \
  --name fincafe-app \
  fincafe:v1.0.0
```

## Troubleshooting

### Port already in use

If port 3000 or 5432 is already in use, edit `docker-compose.yml` or `.env` file to change the ports.

### Database connection issues

1. Check if PostgreSQL is healthy:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

### Application won't start

1. Check application logs:
   ```bash
   docker-compose logs app
   ```

2. Rebuild the image:
   ```bash
   docker-compose up -d --build app
   ```

### Clear everything and start fresh

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## Multi-stage Build Explanation

The Dockerfile uses a multi-stage build for optimization:

1. **base**: Common base image with Node.js
2. **deps**: Installs dependencies and generates Prisma Client
3. **builder**: Builds the Next.js application with Nx
4. **runner**: Production image with minimal footprint

This approach:
- Reduces final image size
- Improves build caching
- Separates build and runtime dependencies
- Runs as non-root user for security

## Performance Tips

1. Use `.dockerignore` to exclude unnecessary files
2. Enable Docker BuildKit for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   docker build -t fincafe:latest .
   ```

3. Use layer caching by mounting npm cache:
   ```bash
   docker build \
     --cache-from fincafe:latest \
     -t fincafe:latest .
   ```

## Support

For issues or questions, please refer to the main README.md or open an issue in the repository.
