import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFarmDatabase } from '@/lib/database';

// GET /api/farm/[farmCode]/harvests - List all harvest collections
export async function GET(
  request: Request,
  { params }: { params: Promise<{ farmCode: string }> }
) {
  try {
    const { farmCode } = await params;

    // Get farm information from main database
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    // Get tenant-specific Prisma client
    const tenantPrisma = getFarmDatabase(farm.databaseName);

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};
    if (startDate && endDate) {
      where.collectionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Fetch harvests with related data
    const harvests = await tenantPrisma.harvestCollection.findMany({
      where,
      include: {
        plot: true,
        cropType: true,
      },
      orderBy: {
        collectionDate: 'desc',
      },
    });

    return NextResponse.json({ harvests });
  } catch (error) {
    console.error('Error fetching harvests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch harvests' },
      { status: 500 }
    );
  }
}

// POST /api/farm/[farmCode]/harvests - Create a new harvest collection
export async function POST(
  request: Request,
  { params }: { params: Promise<{ farmCode: string }> }
) {
  try {
    const { farmCode } = await params;
    const body = await request.json();

    // Get farm information from main database
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    // Get tenant-specific Prisma client
    const tenantPrisma = getFarmDatabase(farm.databaseName);

    // Create harvest collection
    const harvest = await tenantPrisma.harvestCollection.create({
      data: {
        plotId: body.plotId,
        cropTypeId: body.cropTypeId,
        pickerName: body.pickerName,
        kilograms: parseFloat(body.kilograms),
        collectionDate: body.collectionDate ? new Date(body.collectionDate) : new Date(),
        notes: body.notes || null,
      },
      include: {
        plot: true,
        cropType: true,
      },
    });

    return NextResponse.json(harvest, { status: 201 });
  } catch (error) {
    console.error('Error creating harvest:', error);
    return NextResponse.json(
      { error: 'Failed to create harvest collection' },
      { status: 500 }
    );
  }
}
