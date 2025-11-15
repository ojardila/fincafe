import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFarmDatabase } from '@/lib/database';

// GET /api/farm/[farmCode]/plots/[id] - Get a single plot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string; id: string }> }
) {
  try {
    const { farmCode, id } = await params;
    
    // Verify farm exists and get database name
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const farmDb = getFarmDatabase(farm.databaseName);

    const plot = await farmDb.plot.findUnique({
      where: { id },
      include: {
        crops: {
          include: {
            cropType: true,
            variety: true,
          },
        },
      },
    });

    if (!plot) {
      return NextResponse.json(
        { error: 'Plot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ plot });
  } catch (error) {
    console.error('Error fetching plot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plot' },
      { status: 500 }
    );
  }
}

// PATCH /api/farm/[farmCode]/plots/[id] - Update a plot
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string; id: string }> }
) {
  try {
    const { farmCode, id } = await params;
    
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

    // Delete existing crops if new crops are provided
    if (crops) {
      await farmDb.plotCrop.deleteMany({
        where: { plotId: id },
      });
    }

    // Update plot
    const plot = await farmDb.plot.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(totalArea && { totalArea: parseFloat(totalArea) }),
        ...(department && { department }),
        ...(municipality && { municipality }),
        ...(map !== undefined && { map }),
        ...(crops && {
          crops: {
            create: crops.map((crop: { cropTypeId: string; varietyId?: string }) => ({
              cropTypeId: crop.cropTypeId,
              varietyId: crop.varietyId || null,
            })),
          },
        }),
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

    return NextResponse.json({ plot });
  } catch (error) {
    console.error('Error updating plot:', error);
    return NextResponse.json(
      { error: 'Failed to update plot' },
      { status: 500 }
    );
  }
}

// DELETE /api/farm/[farmCode]/plots/[id] - Soft delete a plot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string; id: string }> }
) {
  try {
    const { farmCode, id } = await params;
    
    // Verify farm exists and get database name
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const farmDb = getFarmDatabase(farm.databaseName);

    // Check if plot has any harvest collections
    const harvestCount = await farmDb.harvestCollection.count({
      where: { plotId: id },
    });

    if (harvestCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete plot with harvest collections',
          message: `This plot has ${harvestCount} harvest collection(s) associated with it. Please remove or reassign these collections before deleting the plot.`,
          harvestCount 
        },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const plot = await farmDb.plot.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ 
      message: 'Plot deleted successfully',
      plot 
    });
  } catch (error) {
    console.error('Error deleting plot:', error);
    return NextResponse.json(
      { error: 'Failed to delete plot' },
      { status: 500 }
    );
  }
}
