import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFarmDatabase } from '@/lib/database';

// GET /api/farm/[farmCode]/crop-types - List all crop types
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

    const cropTypes = await farmDb.cropType.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
      include: {
        varieties: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ cropTypes });
  } catch (error) {
    console.error('Error fetching crop types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crop types' },
      { status: 500 }
    );
  }
}

// POST /api/farm/[farmCode]/crop-types - Create a new crop type
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

    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if crop type already exists
    const existing = await farmDb.cropType.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Crop type already exists' },
        { status: 409 }
      );
    }

    const cropType = await farmDb.cropType.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json({ cropType }, { status: 201 });
  } catch (error) {
    console.error('Error creating crop type:', error);
    return NextResponse.json(
      { error: 'Failed to create crop type' },
      { status: 500 }
    );
  }
}
