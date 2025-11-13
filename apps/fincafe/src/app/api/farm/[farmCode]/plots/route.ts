import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFarmDatabase } from '@/lib/database';

// GET /api/farm/[farmCode]/plots - List all plots
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

    const plots = await farmDb.plot.findMany({
      where: { isActive: true },
      include: {
        crops: {
          include: {
            cropType: true,
            variety: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ plots });
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plots' },
      { status: 500 }
    );
  }
}

// POST /api/farm/[farmCode]/plots - Create a new plot
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

    const { name, totalArea, department, municipality, map, crops } = body;

    // Validate required fields
    if (!name || !totalArea || !department || !municipality) {
      return NextResponse.json(
        { error: 'Name, total area, department, and municipality are required' },
        { status: 400 }
      );
    }

    // Create plot with crops
    const plot = await farmDb.plot.create({
      data: {
        name,
        totalArea: parseFloat(totalArea),
        department,
        municipality,
        map: map || null,
        crops: {
          create: crops?.map((crop: { cropTypeId: string; varietyId?: string }) => ({
            cropTypeId: crop.cropTypeId,
            varietyId: crop.varietyId || null,
          })) || [],
        },
      },
      include: {
        crops: {
          include: {
            cropType: true,
            variety: true,
          },
        },
      },
    });

    return NextResponse.json({ plot }, { status: 201 });
  } catch (error) {
    console.error('Error creating plot:', error);
    return NextResponse.json(
      { error: 'Failed to create plot' },
      { status: 500 }
    );
  }
}
