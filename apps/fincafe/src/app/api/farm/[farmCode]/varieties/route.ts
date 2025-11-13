import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFarmDatabase } from '@/lib/database';

// GET /api/farm/[farmCode]/varieties - List all varieties
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string }> }
) {
  try {
    const { farmCode } = await params;
    
    // Verify farm exists and get database name
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const farmDb = getFarmDatabase(farm.databaseName);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const cropTypeId = searchParams.get('cropTypeId');

    const varieties = await farmDb.variety.findMany({
      where: {
        ...(cropTypeId && { cropTypeId }),
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      include: {
        cropType: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ varieties });
  } catch (error) {
    console.error('Error fetching varieties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch varieties' },
      { status: 500 }
    );
  }
}

// POST /api/farm/[farmCode]/varieties - Create a new variety
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string }> }
) {
  try {
    const { farmCode } = await params;
    
    // Verify farm exists and get database name
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const farmDb = getFarmDatabase(farm.databaseName);
    const body = await request.json();

    const { name, cropTypeId, description } = body;

    if (!name || !cropTypeId) {
      return NextResponse.json(
        { error: 'Name and crop type are required' },
        { status: 400 }
      );
    }

    // Check if variety already exists for this crop type
    const existing = await farmDb.variety.findFirst({
      where: {
        name,
        cropTypeId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Variety already exists for this crop type' },
        { status: 409 }
      );
    }

    const variety = await farmDb.variety.create({
      data: {
        name,
        cropTypeId,
        description: description || null,
      },
      include: {
        cropType: true,
      },
    });

    return NextResponse.json({ variety }, { status: 201 });
  } catch (error) {
    console.error('Error creating variety:', error);
    return NextResponse.json(
      { error: 'Failed to create variety' },
      { status: 500 }
    );
  }
}
