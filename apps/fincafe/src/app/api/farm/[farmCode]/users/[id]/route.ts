import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getFarmDatabase } from '../../../../../../lib/database';

// GET /api/farm/[farmCode]/users/[id] - Get a single user
export async function GET(
  request: Request,
  { params }: { params: { farmCode: string; id: string } }
) {
  try {
    const farm = await prisma.farm.findUnique({
      where: { code: params.farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const farmDb = getFarmDatabase(farm.databaseName);

    const user = await farmDb.user.findUnique({
      where: { id: params.id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching farm user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/farm/[farmCode]/users/[id] - Update a user
export async function PATCH(
  request: Request,
  { params }: { params: { farmCode: string; id: string } }
) {
  try {
    const body = await request.json();
    const { email, name, password, roleId } = body;

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

    const farmDb = getFarmDatabase(farm.databaseName);

    const user = await farmDb.user.update({
      where: { id: params.id },
      data: {
        ...(email && { email }),
        ...(name !== undefined && { name }),
        ...(password && { password }),
        ...(roleId !== undefined && { roleId }),
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating farm user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/farm/[farmCode]/users/[id] - Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { farmCode: string; id: string } }
) {
  try {
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

    const farmDb = getFarmDatabase(farm.databaseName);

    await farmDb.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting farm user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
