import { PrismaClient } from '@prisma/client';

// Cache for farm database connections
const farmDatabases = new Map<string, PrismaClient>();

/**
 * Get a Prisma client for a specific farm database
 * @param databaseName - The name of the farm database (e.g., "customer_farm1")
 * @returns PrismaClient instance connected to the farm database
 */
export function getFarmDatabase(databaseName: string): PrismaClient {
  // Return cached connection if it exists
  if (farmDatabases.has(databaseName)) {
    const cachedDb = farmDatabases.get(databaseName);
    if (cachedDb) return cachedDb;
  }

  // Extract base URL from main DATABASE_URL
  const baseUrl = process.env.DATABASE_URL || '';
  const urlParts = baseUrl.split('/');
  const farmDatabaseUrl = urlParts.slice(0, -1).join('/') + `/${databaseName}?schema=public`;

  // Create new Prisma client for this farm database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: farmDatabaseUrl,
      },
    },
  });

  // Cache the connection
  farmDatabases.set(databaseName, prisma);

  return prisma;
}

/**
 * Close all farm database connections
 * Useful for cleanup in serverless environments
 */
export async function closeAllFarmDatabases(): Promise<void> {
  const promises = Array.from(farmDatabases.values()).map((prisma) =>
    prisma.$disconnect()
  );
  await Promise.all(promises);
  farmDatabases.clear();
}

/**
 * Create a new database for a farm
 * @param databaseName - The name of the database to create
 */
export async function createFarmDatabase(
  databaseName: string
): Promise<void> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Create the database
    await prisma.$executeRawUnsafe(
      `CREATE DATABASE "${databaseName}" WITH ENCODING 'UTF8'`
    );
    console.log(`Database ${databaseName} created successfully`);
  } catch (error: unknown) {
    // Ignore error if database already exists
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('already exists')) {
      throw error;
    }
    console.log(`Database ${databaseName} already exists`);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Initialize a farm database with the schema
 * This runs migrations on the newly created database
 * @param databaseName - The name of the database to initialize
 */
export async function initializeFarmDatabase(
  databaseName: string
): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const path = await import('path');
  const execAsync = promisify(exec);

  // Extract base URL from main DATABASE_URL
  const baseUrl = process.env.DATABASE_URL || '';
  const urlParts = baseUrl.split('/');
  const farmDatabaseUrl = urlParts.slice(0, -1).join('/') + `/${databaseName}?schema=public`;

  // Find the workspace root (where prisma directory is)
  const workspaceRoot = process.cwd().includes('apps/fincafe') 
    ? path.join(process.cwd(), '../..')
    : process.cwd();
  
  const schemaPath = path.join(workspaceRoot, 'prisma/schema.prisma');

  try {
    // Run migrations on the farm database
    const { stdout, stderr } = await execAsync(
      `DATABASE_URL="${farmDatabaseUrl}" npx prisma migrate deploy --schema="${schemaPath}"`,
      {
        cwd: workspaceRoot,
      }
    );

    if (stderr && !stderr.includes('Prisma')) {
      console.error('Migration stderr:', stderr);
    }
    console.log('Migration stdout:', stdout);
    console.log(`Database ${databaseName} initialized with schema`);

    // Seed the farm database with default roles and permissions
    await seedFarmDatabase(databaseName);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error initializing farm database:', error);
    throw new Error(`Failed to initialize database: ${errorMessage}`);
  }
}

/**
 * Seed a farm database with default roles and permissions
 * @param databaseName - The name of the farm database to seed
 */
async function seedFarmDatabase(databaseName: string): Promise<void> {
  const farmDb = getFarmDatabase(databaseName);

  try {
    console.log(`Seeding farm database: ${databaseName}`);

    // Create permissions
    const permissionsData = [
      { name: 'users.create', resource: 'users', action: 'create', description: 'Create new users' },
      { name: 'users.read', resource: 'users', action: 'read', description: 'View users' },
      { name: 'users.update', resource: 'users', action: 'update', description: 'Update users' },
      { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users' },
      { name: 'roles.create', resource: 'roles', action: 'create', description: 'Create new roles' },
      { name: 'roles.read', resource: 'roles', action: 'read', description: 'View roles' },
      { name: 'roles.update', resource: 'roles', action: 'update', description: 'Update roles' },
      { name: 'roles.delete', resource: 'roles', action: 'delete', description: 'Delete roles' },
      { name: 'permissions.read', resource: 'permissions', action: 'read', description: 'View permissions' },
      { name: 'permissions.manage', resource: 'permissions', action: 'manage', description: 'Manage permissions' },
    ];

    const permissions = await Promise.all(
      permissionsData.map((perm) =>
        farmDb.permission.upsert({
          where: { name: perm.name },
          update: {},
          create: perm,
        })
      )
    );

    console.log(`Created ${permissions.length} permissions`);

    // Get all permission IDs
    const allPermissionIds = permissions.map((p) => p.id);

    // Manager permissions (user management + read access to roles/permissions)
    const managerPermissionIds = permissions
      .filter((p) => p.resource === 'users' || p.action === 'read')
      .map((p) => p.id);

    // Viewer permissions (read only)
    const viewerPermissionIds = permissions
      .filter((p) => p.action === 'read')
      .map((p) => p.id);

    // Employee permissions (read users and basic operations)
    const employeePermissionIds = permissions
      .filter((p) => p.resource === 'users' && (p.action === 'read' || p.action === 'update'))
      .map((p) => p.id);

    // Create roles
    const adminRole = await farmDb.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrator with full access',
        permissions: {
          connect: allPermissionIds.map((id) => ({ id })),
        },
      },
    });

    const managerRole = await farmDb.role.upsert({
      where: { name: 'manager' },
      update: {},
      create: {
        name: 'manager',
        description: 'Manager with user management access',
        permissions: {
          connect: managerPermissionIds.map((id) => ({ id })),
        },
      },
    });

    const employeeRole = await farmDb.role.upsert({
      where: { name: 'employee' },
      update: {},
      create: {
        name: 'employee',
        description: 'Employee with limited access',
        permissions: {
          connect: employeePermissionIds.map((id) => ({ id })),
        },
      },
    });

    const viewerRole = await farmDb.role.upsert({
      where: { name: 'viewer' },
      update: {},
      create: {
        name: 'viewer',
        description: 'Viewer with read-only access',
        permissions: {
          connect: viewerPermissionIds.map((id) => ({ id })),
        },
      },
    });

    console.log(`Created roles: ${adminRole.name}, ${managerRole.name}, ${employeeRole.name}, ${viewerRole.name}`);

    // Create default Coffee crop type as specified in requirements
    const coffeeCropType = await farmDb.cropType.upsert({
      where: { name: 'Coffee' },
      update: {},
      create: {
        name: 'Coffee',
        description: 'Coffee crop (default)',
      },
    });

    console.log(`Created default crop type: ${coffeeCropType.name}`);
    console.log(`Farm database ${databaseName} seeded successfully`);
  } catch (error) {
    console.error(`Error seeding farm database ${databaseName}:`, error);
    throw error;
  }
}
