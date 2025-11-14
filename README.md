# FinCafe

A user management system built with Next.js, Prisma, PostgreSQL, and Nx monorepo.

## Features

- 🔐 User authentication and authorization
- 👥 User management (CRUD operations)
- 🎭 Role-based access control (RBAC)
- 🔑 Permissions system
- 🏢 Multi-tenant farm system with isolated databases
- 📊 Admin dashboard
- 🌾 Farm-specific user management
- 🐳 Docker Compose for local development

## Tech Stack

- **Framework:** Next.js 15.2.4 (App Router)
- **Language:** TypeScript
- **ORM:** Prisma 6.19.0
- **Database:** PostgreSQL 16
- **Monorepo:** Nx
- **Styling:** Tailwind CSS
- **Containerization:** Docker & Docker Compose

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **Git**

## Getting Started

Follow these steps to set up the project in a fresh environment:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fincafe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://fincafe:fincafe_dev_password@localhost:5432/fincafe_dev?schema=public"
EOF
```

### 4. Start the Database with Docker Compose

Start the PostgreSQL database container:

```bash
docker-compose up -d
```

Verify the container is running:

```bash
docker ps
```

You should see a container named `fincafe-postgres` running.

### 5. Generate Prisma Client

Generate the Prisma client from the schema:

```bash
npx prisma generate
```

### 6. Run Database Migrations

Apply all pending migrations to create the database schema:

```bash
npx prisma migrate deploy
```

For development with migration history:

```bash
npx prisma migrate dev
```

### 7. Seed the Database

Populate the database with initial data (roles and permissions):

```bash
npx prisma db seed
```

This will create:
- **3 Roles:** Super Admin, Admin, Employee
- **14 Permissions:** Including user, role, permission, and farm management
- **Demo Super Admin User:** Email: `admin@fincafe.com`, Password: `admin123`
- **Demo Farm:** A sample farm called "Demo Farm" with code `demo-farm`

### 8. Start the Development Server

Run the Next.js development server using Nx:

```bash
npx nx dev fincafe
```

The application will be available at: **http://localhost:4200**

### 9. Access the Application

#### Default Credentials

After seeding, you can log in with:
- **Email:** `admin@fincafe.com`
- **Password:** `admin123`

⚠️ **Security Warning:** Change this password immediately in production!

#### Application Routes

- **Home:** http://localhost:4200/ (redirects to login or admin)
- **Login:** http://localhost:4200/login
- **Admin Dashboard:** http://localhost:4200/admin/users
- **Roles Management:** http://localhost:4200/admin/roles
- **Permissions View:** http://localhost:4200/admin/permissions
- **Farms Management:** http://localhost:4200/admin/farms
- **Farm Access:** http://localhost:4200/farm/[farmCode] (e.g., /farm/demo-farm)

### 10. Initialize Farm Database (Optional)

To use the demo farm, you need to initialize its database:

1. Log in to the admin panel
2. Go to **Farms** section
3. Click **Initialize DB** on the Demo Farm card
4. Once initialized, click **Open Farm** to access the farm's isolated workspace

## Project Structure

```
fincafe/
├── apps/
│   └── fincafe/              # Main Next.js application
│       └── src/
│           ├── app/          # Next.js App Router pages
│           │   ├── admin/    # Admin section (protected)
│           │   │   ├── users/       # User management UI
│           │   │   ├── roles/       # Role management UI
│           │   │   ├── permissions/ # Permissions view
│           │   │   └── farms/       # Farm management UI
│           │   ├── farm/     # Farm-specific section
│           │   │   └── [farmCode]/  # Dynamic farm routes
│           │   │       └── users/   # Farm user management
│           │   ├── api/      # API routes
│           │   │   ├── users/       # User CRUD API
│           │   │   ├── roles/       # Role CRUD API
│           │   │   ├── farms/       # Farm CRUD API
│           │   │   └── farm/        # Farm-specific APIs
│           │   │       └── [farmCode]/
│           │   │           └── users/ # Farm user API
│           │   │   ├── permissions/ # Permissions API
│           │   │   └── auth/        # Authentication API
│           │   └── login/    # Login page
│           ├── contexts/     # React contexts (Auth)
│           └── lib/          # Utilities (Prisma client)
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Seed script
│   └── migrations/           # Migration history
├── docker-compose.yml        # PostgreSQL container config
└── .env                      # Environment variables
```

## Database Schema

### User Model
- `id`: String (UUID)
- `email`: String (unique)
- `password`: String
- `name`: String
- `roleId`: String (optional, FK to Role)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Role Model
- `id`: String (UUID)
- `name`: String (unique)
- `description`: String (optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relations: `users[]`, `permissions[]` (many-to-many)

### Permission Model
- `id`: String (UUID)
- `resource`: String (e.g., "users", "roles")
- `action`: String (e.g., "create", "read", "update", "delete")
- `description`: String (optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relations: `roles[]` (many-to-many)

### Farm Model (Multi-Tenancy)
- `id`: String (UUID)
- `name`: String (farm display name)
- `code`: String (unique, URL-safe identifier)
- `databaseName`: String (unique, e.g., "customer_demo_farm")
- `description`: String (optional)
- `isActive`: Boolean (default: true)
- `createdById`: String (FK to User - super admin who created it)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Note:** Each farm has its own isolated PostgreSQL database with the same schema (User, Role, Permission models).

## Available Commands

### Development

```bash
# Start development server
npx nx dev fincafe

# Run tests
npx nx test fincafe

# Run e2e tests
npx nx e2e fincafe-e2e
```

### Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Deploy migrations (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Docker

```bash
# Start database only
docker-compose up -d postgres

# Start all services (database + app)
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

**Docker Helper Script:** For easier Docker management, use:

```bash
# Make executable (first time only)
chmod +x docker-helper.sh

# View available commands
./docker-helper.sh help

# Quick commands
./docker-helper.sh up        # Start all services
./docker-helper.sh down      # Stop all services
./docker-helper.sh rebuild   # Rebuild and restart
./docker-helper.sh logs app  # View app logs
./docker-helper.sh migrate   # Run migrations
./docker-helper.sh seed      # Seed database
```

For detailed Docker setup instructions, see [DOCKER.md](./DOCKER.md)

### Build

```bash
# Create production build
npx nx build fincafe

# Preview production build
npx nx start fincafe
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Roles
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create a new role
- `GET /api/roles/:id` - Get role by ID
- `PATCH /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Permissions
- `GET /api/permissions` - List all permissions

### Farms (Super Admin Only)
- `GET /api/farms` - List all farms
- `POST /api/farms` - Create a new farm
- `GET /api/farms/:id` - Get farm by ID
- `PATCH /api/farms/:id` - Update farm
- `DELETE /api/farms/:id` - Delete farm
- `POST /api/farms/:id/initialize` - Initialize farm database

### Farm-Specific Users
- `GET /api/farm/:farmCode/users` - List users in a farm
- `POST /api/farm/:farmCode/users` - Create user in a farm
- `GET /api/farm/:farmCode/users/:id` - Get farm user by ID
- `PATCH /api/farm/:farmCode/users/:id` - Update farm user
- `DELETE /api/farm/:farmCode/users/:id` - Delete farm user

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

1. Verify Docker container is running: `docker ps`
2. Check database logs: `docker-compose logs postgres`
3. Verify `.env` file has correct `DATABASE_URL`
4. Restart the container: `docker-compose restart`

### Prisma Client Not Found

If you get "Cannot find module '@prisma/client'":

1. Generate the client: `npx prisma generate`
2. Restart the dev server: `npx nx dev fincafe`

### Migration Issues

If migrations fail:

1. Check database is running: `docker ps`
2. Reset database (dev only): `npx prisma migrate reset`
3. Reapply migrations: `npx prisma migrate deploy`

### Port Already in Use

If port 4200 or 5432 is already in use:

- For Next.js: Change port with `PORT=3000 npx nx dev fincafe`
- For PostgreSQL: Update `docker-compose.yml` ports and `DATABASE_URL` in `.env`

### Farm Database Not Initializing

If farm database initialization fails:

1. Ensure main database is running: `docker ps`
2. Check PostgreSQL user has CREATE DATABASE permission
3. Verify the database name doesn't already exist
4. Check logs in the browser console or terminal

## Multi-Tenant Architecture

### How It Works

FinCafe implements a **database-per-tenant** multi-tenancy model:

1. **Main Database** (`fincafe_dev`):
   - Stores global users, roles, permissions
   - Stores farm metadata (Farm model)
   - Admin operations happen here

2. **Farm Databases** (`customer_<farmCode>`):
   - Each farm has its own isolated PostgreSQL database
   - Same schema as main database (User, Role, Permission models)
   - Complete data isolation between farms
   - Farm-specific operations use dynamic database connections

### Creating a New Farm

1. Log in as super admin
2. Navigate to **Admin → Farms**
3. Click **Create New Farm**
4. Fill in farm details (name, code)
5. Click **Initialize DB** to create and migrate the farm database
6. Access the farm at `/farm/<farm-code>`

### Farm Database Management

- **Dynamic Connections:** Farm databases are accessed using Prisma client with dynamic connection strings
- **Migrations:** When you run `npx prisma migrate deploy`, it applies to the main database. Farm databases are initialized with the same schema when you click "Initialize DB"
- **Isolation:** Each farm's data is completely separate - no shared users, roles, or permissions
- **Scalability:** This architecture allows horizontal scaling by distributing farm databases across multiple PostgreSQL servers

## Security Notes

⚠️ **Important:** This project currently stores passwords in plain text and uses localStorage for session management. For production use, you should:

1. **Implement password hashing** with bcrypt
2. **Use JWT tokens** or HTTP-only cookies instead of localStorage
3. **Add CSRF protection**
4. **Implement rate limiting** on authentication endpoints
5. **Add input validation** middleware
6. **Use environment-specific secrets**

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "Add your feature"`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

## License

[Specify your license here]

## Links

- [Nx Documentation](https://nx.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
