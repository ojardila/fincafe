import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFarmDatabase } from '@/lib/database';

// GET /api/farm/[farmCode]/crop-types/[id] - Get single crop type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string; id: string }> }
) {
  try {
    const { farmCode, id } = await params;
    
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const farmDb = getFarmDatabase(farm.databaseName);
    const cropType = await farmDb.cropType.findUnique({
      where: { id },
      include: {
        varieties: true,
      },
    });

    if (!cropType) {
      return NextResponse.json({ error: 'Crop type not found' }, { status: 404 });
    }

    return NextResponse.json({ cropType });
  } catch (error) {
    console.error('Error fetching crop type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crop type' },
      { status: 500 }
    );
  }
}

// PATCH /api/farm/[farmCode]/crop-types/[id] - Update crop type
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string; id: string }> }
) {
  try {
    const { farmCode, id } = await params;
    
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const farmDb = getFarmDatabase(farm.databaseName);
    const body = await request.json();
    const { name, description } = body;

    // Check if crop type exists
    const existing = await farmDb.cropType.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Crop type not found' }, { status: 404 });
    }

    // Check if new name conflicts with another crop type
    if (name && name !== existing.name) {
      const nameExists = await farmDb.cropType.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'Crop type name already exists' },
          { status: 409 }
        );
      }
    }

    const cropType = await farmDb.cropType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
      },
    });

    return NextResponse.json({ cropType });
  } catch (error) {
    console.error('Error updating crop type:', error);
    return NextResponse.json(
      { error: 'Failed to update crop type' },
      { status: 500 }
    );
  }
}

// DELETE /api/farm/[farmCode]/crop-types/[id] - Delete crop type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string; id: string }> }
) {
  try {
    const { farmCode, id } = await params;
    
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const farmDb = getFarmDatabase(farm.databaseName);

    // Check if crop type exists
    const cropType = await farmDb.cropType.findUnique({
      where: { id },
      include: {
        varieties: true,
        plots: true,
        harvestCollections: true,
      },
    });

    if (!cropType) {
      return NextResponse.json({ error: 'Crop type not found' }, { status: 404 });
    }

    // Check if crop type is being used
    if (cropType.varieties.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete crop type with varieties',
          details: `This crop type has ${cropType.varieties.length} varieties. Delete them first.`
        },
        { status: 400 }
      );
    }

    if (cropType.plots.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete crop type in use',
          details: `This crop type is used in ${cropType.plots.length} plots.`
        },
        { status: 400 }
      );
    }

    if (cropType.harvestCollections.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete crop type with harvest data',
          details: `This crop type has ${cropType.harvestCollections.length} harvest records.`
        },
        { status: 400 }
      );
    }

    // Delete the crop type
    await farmDb.cropType.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Crop type deleted successfully' });
  } catch (error) {
    console.error('Error deleting crop type:', error);
    return NextResponse.json(
      { error: 'Failed to delete crop type' },
      { status: 500 }
    );
  }
}
