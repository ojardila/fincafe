import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getFarmDatabase } from '../../../../../lib/database';

// GET /api/farm/[farmCode]/roles - List all roles in a farm
export async function GET(
  request: Request,
  { params }: { params: { farmCode: string } }
) {
  try {
    // Get farm information from main database
    const farm = await prisma.farm.findUnique({
      where: { code: params.farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    if (!farm.isActive) {
      return NextResponse.json(
        { error: 'Farm is not active' },
        { status: 403 }
      );
    }

    // Get farm database connection
    const farmDb = getFarmDatabase(farm.databaseName);

    // Fetch roles from farm database with user and permission counts
    const roles = await farmDb.role.findMany({
      include: {
        permissions: {
          select: {
            id: true,
            name: true,
            resource: true,
            action: true,
          },
        },
        users: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to include counts
    const rolesWithCounts = roles.map((role) => ({
      ...role,
      userCount: role.users.length,
      permissionCount: role.permissions.length,
    }));

    return NextResponse.json(rolesWithCounts);
  } catch (error) {
    console.error('Error fetching farm roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/farm/[farmCode]/roles - Create a new role in a farm
export async function POST(
  request: Request,
  { params }: { params: { farmCode: string } }
) {
  try {
    const body = await request.json();
    const { name, description, permissionIds } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Get farm information
    const farm = await prisma.farm.findUnique({
      where: { code: params.farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    if (!farm.isActive) {
      return NextResponse.json(
        { error: 'Farm is not active' },
        { status: 403 }
      );
    }

    // Get farm database connection
    const farmDb = getFarmDatabase(farm.databaseName);

    // Create role in farm database
    const role = await farmDb.role.create({
      data: {
        name,
        description,
        ...(permissionIds &&
          permissionIds.length > 0 && {
            permissions: {
              connect: permissionIds.map((id: string) => ({ id })),
            },
          }),
      },
      include: {
        permissions: true,
        users: true,
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Error creating farm role:', error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A role with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}
