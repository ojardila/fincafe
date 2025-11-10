import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create permissions
  const permissions = await Promise.all([
    // User permissions
    prisma.permission.upsert({
      where: { name: 'users.create' },
      update: {},
      create: {
        name: 'users.create',
        description: 'Create new users',
        resource: 'users',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.read' },
      update: {},
      create: {
        name: 'users.read',
        description: 'View users',
        resource: 'users',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.update' },
      update: {},
      create: {
        name: 'users.update',
        description: 'Update users',
        resource: 'users',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.delete' },
      update: {},
      create: {
        name: 'users.delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
      },
    }),
    // Role permissions
    prisma.permission.upsert({
      where: { name: 'roles.create' },
      update: {},
      create: {
        name: 'roles.create',
        description: 'Create new roles',
        resource: 'roles',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.read' },
      update: {},
      create: {
        name: 'roles.read',
        description: 'View roles',
        resource: 'roles',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.update' },
      update: {},
      create: {
        name: 'roles.update',
        description: 'Update roles',
        resource: 'roles',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.delete' },
      update: {},
      create: {
        name: 'roles.delete',
        description: 'Delete roles',
        resource: 'roles',
        action: 'delete',
      },
    }),
    // Permission permissions
    prisma.permission.upsert({
      where: { name: 'permissions.read' },
      update: {},
      create: {
        name: 'permissions.read',
        description: 'View permissions',
        resource: 'permissions',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions.manage' },
      update: {},
      create: {
        name: 'permissions.manage',
        description: 'Manage permissions',
        resource: 'permissions',
        action: 'manage',
      },
    }),
  ]);

  console.log('Created permissions:', permissions.length);

  // Get all permission IDs for super admin
  const allPermissions = await prisma.permission.findMany();
  const allPermissionIds = allPermissions.map((p) => p.id);

  // Admin permissions (all except role/permission management)
  const adminPermissions = allPermissions
    .filter(
      (p) => p.resource === 'users' || (p.resource === 'roles' && p.action === 'read')
    )
    .map((p) => p.id);

  // Employee permissions (read only)
  const employeePermissions = allPermissions
    .filter((p) => p.action === 'read')
    .map((p) => p.id);

  // Create roles
  const superAdmin = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Super Administrator with full system access',
      permissions: {
        connect: allPermissionIds.map((id) => ({ id })),
      },
    },
  });

  const admin = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with user management access',
      permissions: {
        connect: adminPermissions.map((id) => ({ id })),
      },
    },
  });

  const employee = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      description: 'Employee with read-only access',
      permissions: {
        connect: employeePermissions.map((id) => ({ id })),
      },
    },
  });

  console.log('Created roles:', {
    superAdmin: superAdmin.name,
    admin: admin.name,
    employee: employee.name,
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
