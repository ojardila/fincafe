import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getFarmDatabase } from '../../../../../lib/database';

// GET /api/farm/[farmCode]/permissions - List all permissions in a farm
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

    // Fetch permissions from farm database
    const permissions = await farmDb.permission.findMany({
      include: {
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching farm permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
