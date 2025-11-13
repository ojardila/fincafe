import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/farms/[id] - Get a single farm
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: params.id },
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

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json(farm);
  } catch (error) {
    console.error('Error fetching farm:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farm' },
      { status: 500 }
    );
  }
}

// PATCH /api/farms/[id] - Update a farm
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, isActive } = body;

    const farm = await prisma.farm.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
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

    return NextResponse.json(farm);
  } catch (error) {
    console.error('Error updating farm:', error);
    return NextResponse.json(
      { error: 'Failed to update farm' },
      { status: 500 }
    );
  }
}

// DELETE /api/farms/[id] - Delete a farm
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.farm.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Farm deleted successfully' });
  } catch (error) {
    console.error('Error deleting farm:', error);
    return NextResponse.json(
      { error: 'Failed to delete farm' },
      { status: 500 }
    );
  }
}
