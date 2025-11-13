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

  console.log('Created roles:', {
    superAdmin: superAdmin.name,
    admin: admin.name,
  });

  // Create a super admin user
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'admin@fincafe.com' },
    update: {},
    create: {
      email: 'admin@fincafe.com',
      name: 'Super Admin',
      password: 'admin123', // In production, use bcrypt!
      roleId: superAdmin.id,
    },
  });

  console.log('Created super admin user:', superAdminUser.email);

  // Create farm permissions
  const farmPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'farms.create' },
      update: {},
      create: {
        name: 'farms.create',
        description: 'Create new farms',
        resource: 'farms',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'farms.read' },
      update: {},
      create: {
        name: 'farms.read',
        description: 'View farms',
        resource: 'farms',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'farms.update' },
      update: {},
      create: {
        name: 'farms.update',
        description: 'Update farms',
        resource: 'farms',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'farms.delete' },
      update: {},
      create: {
        name: 'farms.delete',
        description: 'Delete farms',
        resource: 'farms',
        action: 'delete',
      },
    }),
  ]);

  console.log('Created farm permissions:', farmPermissions.length);

  // Update super admin role with farm permissions
  await prisma.role.update({
    where: { id: superAdmin.id },
    data: {
      permissions: {
        connect: farmPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  // Create a demo farm
  const demoFarm = await prisma.farm.upsert({
    where: { code: 'demo-farm' },
    update: {},
    create: {
      name: 'Demo Farm',
      code: 'demo-farm',
      databaseName: 'customer_demo_farm',
      description: 'A demonstration farm for testing purposes',
      createdById: superAdminUser.id,
      isActive: true,
    },
  });

  console.log('Created demo farm:', demoFarm.name);

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
