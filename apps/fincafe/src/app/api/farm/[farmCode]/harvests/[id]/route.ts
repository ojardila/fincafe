import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFarmDatabase } from '@/lib/database';

// GET /api/farm/[farmCode]/harvests/[id] - Get a specific harvest collection
export async function GET(
  request: Request,
  { params }: { params: Promise<{ farmCode: string; id: string }> }
) {
  try {
    const { farmCode, id } = await params;

    // Get farm information from main database
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    // Get tenant-specific Prisma client
    const tenantPrisma = getFarmDatabase(farm.databaseName);

    const harvest = await tenantPrisma.harvestCollection.findUnique({
      where: { id },
      include: {
        plot: true,
        cropType: true,
      },
    });

    if (!harvest) {
      return NextResponse.json(
        { error: 'Harvest collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(harvest);
  } catch (error) {
    console.error('Error fetching harvest:', error);
    return NextResponse.json(
      { error: 'Failed to fetch harvest collection' },
      { status: 500 }
    );
  }
}

// PATCH /api/farm/[farmCode]/harvests/[id] - Update a harvest collection
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ farmCode: string; id: string }> }
) {
  try {
    const { farmCode, id } = await params;
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

    const updateData: Record<string, unknown> = {};
    if (body.plotId !== undefined) updateData.plotId = body.plotId;
    if (body.cropTypeId !== undefined) updateData.cropTypeId = body.cropTypeId;
    if (body.pickerName !== undefined) updateData.pickerName = body.pickerName;
    if (body.kilograms !== undefined) updateData.kilograms = parseFloat(body.kilograms);
    if (body.collectionDate !== undefined) updateData.collectionDate = new Date(body.collectionDate);
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    const harvest = await tenantPrisma.harvestCollection.update({
      where: { id },
      data: updateData,
      include: {
        plot: true,
        cropType: true,
      },
    });

    return NextResponse.json(harvest);
  } catch (error) {
    console.error('Error updating harvest:', error);
    return NextResponse.json(
      { error: 'Failed to update harvest collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/farm/[farmCode]/harvests/[id] - Delete a harvest collection
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ farmCode: string; id: string }> }
) {
  try {
    const { farmCode, id } = await params;

    // Get farm information from main database
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    // Get tenant-specific Prisma client
    const tenantPrisma = getFarmDatabase(farm.databaseName);

    await tenantPrisma.harvestCollection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting harvest:', error);
    return NextResponse.json(
      { error: 'Failed to delete harvest collection' },
      { status: 500 }
    );
  }
}
