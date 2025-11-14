import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getFarmDatabase } from '../../../../../lib/database';

// GET /api/farm/[farmCode]/users - List all users in a farm
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role'); // e.g., ?role=employee

    // Fetch users from farm database
    try {
      const users = await farmDb.user.findMany({
        where: roleFilter
          ? {
              role: {
                name: {
                  equals: roleFilter,
                  mode: 'insensitive',
                },
              },
            }
          : undefined,
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Remove passwords from response
      const usersWithoutPassword = users.map(({ password, ...user }) => user);

      return NextResponse.json(usersWithoutPassword);
    } catch (dbError: unknown) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      
      // Check if database doesn't exist
      if (errorMessage.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Farm database not initialized',
            message: 'Please initialize the farm database first from the admin panel.',
            needsInitialization: true
          },
          { status: 503 }
        );
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching farm users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/farm/[farmCode]/users - Create a new user in a farm
export async function POST(
  request: Request,
  { params }: { params: { farmCode: string } }
) {
  try {
    const body = await request.json();
    const { email, name, password, roleId } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Create user in farm database
    try {
      const user = await farmDb.user.create({
        data: {
          email,
          name,
          password,
          ...(roleId && { roleId }),
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (dbError: unknown) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      
      // Check if database doesn't exist
      if (errorMessage.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Farm database not initialized',
            message: 'Please initialize the farm database first from the admin panel.'
          },
          { status: 503 }
        );
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating farm user:', error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
