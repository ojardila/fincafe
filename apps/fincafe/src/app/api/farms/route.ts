import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/farms - List all farms
export async function GET() {
  try {
    const farms = await prisma.farm.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(farms);
  } catch (error) {
    console.error('Error fetching farms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farms' },
      { status: 500 }
    );
  }
}

// POST /api/farms - Create a new farm
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description, createdById } = body;

    // Validate required fields
    if (!name || !code || !createdById) {
      return NextResponse.json(
        { error: 'Name, code, and createdById are required' },
        { status: 400 }
      );
    }

    // Validate code format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(code)) {
      return NextResponse.json(
        { error: 'Code must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Generate database name
    const databaseName = `customer_${code}`;

    // Create the farm
    const farm = await prisma.farm.create({
      data: {
        name,
        code,
        databaseName,
        description,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    console.error('Error creating farm:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A farm with this code already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create farm' },
      { status: 500 }
    );
  }
}
