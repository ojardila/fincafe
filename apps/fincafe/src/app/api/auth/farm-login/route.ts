import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFarmDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { farmCode, email, password } = body;

    if (!farmCode || !email || !password) {
      return NextResponse.json(
        { error: 'Farm code, email, and password are required' },
        { status: 400 }
      );
    }

    // First, verify the farm exists in the main database
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json(
        { error: 'Invalid farm code' },
        { status: 404 }
      );
    }

    if (!farm.isActive) {
      return NextResponse.json(
        { error: 'This farm is not active' },
        { status: 403 }
      );
    }

    // Get farm-specific database connection
    const farmDb = getFarmDatabase(farm.databaseName);

    // Find user in farm database
    const user = await farmDb.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // In production, you should use bcrypt to compare hashed passwords
    // For now, doing simple comparison (NOT SECURE FOR PRODUCTION)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.role) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 500 }
      );
    }

    // Return user data (in production, create a session/JWT token)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.permissions.map((p) => ({
            id: p.id,
            name: p.name,
            resource: p.resource,
            action: p.action,
          })),
        },
      },
      farm: {
        code: farm.code,
        name: farm.name,
      },
    });
  } catch (error) {
    console.error('Farm login error:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json(
        { 
          error: 'Farm database not initialized. Please contact your administrator.',
          needsInitialization: true 
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
