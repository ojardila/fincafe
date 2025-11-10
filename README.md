# FinCafe

A user management system built with Next.js, Prisma, PostgreSQL, and Nx monorepo.

## Features

- 🔐 User authentication and authorization
- 👥 User management (CRUD operations)
- 🎭 Role-based access control (RBAC)
- 🔑 Permissions system
- 📊 Admin dashboard
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
- **10 Permissions:** users.create, users.read, users.update, users.delete, roles.create, roles.read, roles.update, roles.delete, permissions.read, permissions.update

### 8. Start the Development Server

Run the Next.js development server using Nx:

```bash
npx nx dev fincafe
```

The application will be available at: **http://localhost:4200**

### 9. Access the Application

#### Default Credentials

After seeding, you can create users through the admin interface. For initial access, you'll need to create a user manually or update the seed script.

#### Application Routes

- **Home:** http://localhost:4200/ (redirects to login or admin)
- **Login:** http://localhost:4200/login
- **Admin Dashboard:** http://localhost:4200/admin/users
- **Roles Management:** http://localhost:4200/admin/roles
- **Permissions View:** http://localhost:4200/admin/permissions

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
│           │   │   └── permissions/ # Permissions view
│           │   ├── api/      # API routes
│           │   │   ├── users/       # User CRUD API
│           │   │   ├── roles/       # Role CRUD API
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
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

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
