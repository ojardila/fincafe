import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFarmDatabase } from '@/lib/database';

// GET /api/farm/[farmCode]/varieties/[id] - Get a specific variety
export async function GET(
  request: Request,
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
    const variety = await farmDb.variety.findUnique({
      where: { id },
      include: {
        cropType: true,
      },
    });

    if (!variety) {
      return NextResponse.json(
        { error: 'Variety not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ variety });
  } catch (error) {
    console.error('Error fetching variety:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variety' },
      { status: 500 }
    );
  }
}

// PATCH /api/farm/[farmCode]/varieties/[id] - Update a variety
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ farmCode: string; id: string }> }
) {
  try {
    const { farmCode, id } = await params;
    const body = await request.json();

    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const farmDb = getFarmDatabase(farm.databaseName);

    // Check if name is being updated and if it conflicts
    if (body.name) {
      const existing = await farmDb.variety.findFirst({
        where: {
          name: body.name,
          cropTypeId: body.cropTypeId,
          id: { not: id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'A variety with this name already exists for this crop type' },
          { status: 400 }
        );
      }
    }

    const variety = await farmDb.variety.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
      },
      include: {
        cropType: true,
      },
    });

    return NextResponse.json({ variety });
  } catch (error) {
    console.error('Error updating variety:', error);
    return NextResponse.json(
      { error: 'Failed to update variety' },
      { status: 500 }
    );
  }
}

// DELETE /api/farm/[farmCode]/varieties/[id] - Delete a variety
export async function DELETE(
  request: Request,
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

    // Check if variety is being used in any plots
    const plotsUsingVariety = await farmDb.plotCrop.findFirst({
      where: { varietyId: id },
    });

    if (plotsUsingVariety) {
      return NextResponse.json(
        { error: 'Cannot delete variety. It is currently being used in plots.' },
        { status: 400 }
      );
    }

    await farmDb.variety.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting variety:', error);
    return NextResponse.json(
      { error: 'Failed to delete variety' },
      { status: 500 }
    );
  }
}
