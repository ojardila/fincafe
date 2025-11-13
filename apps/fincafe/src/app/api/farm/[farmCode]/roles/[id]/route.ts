import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getFarmDatabase } from '../../../../../../lib/database';

// GET /api/farm/[farmCode]/roles/[id] - Get a single role
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

    const role = await farmDb.role.findUnique({
      where: { id: params.id },
      include: {
        permissions: true,
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error fetching farm role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// PATCH /api/farm/[farmCode]/roles/[id] - Update a role
export async function PATCH(
  request: Request,
  { params }: { params: { farmCode: string; id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, permissionIds } = body;

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

    // Build update data
    const updateData: {
      name?: string;
      description?: string | null;
      permissions?: { set: { id: string }[] };
    } = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissionIds !== undefined) {
      updateData.permissions = {
        set: permissionIds.map((id: string) => ({ id })),
      };
    }

    const role = await farmDb.role.update({
      where: { id: params.id },
      data: updateData,
      include: {
        permissions: true,
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error updating farm role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE /api/farm/[farmCode]/roles/[id] - Delete a role
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

    // Check if role has users
    const role = await farmDb.role.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: { id: true },
        },
      },
    });

    if (role && role.users.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete role. It is assigned to ${role.users.length} user(s).`,
        },
        { status: 400 }
      );
    }

    await farmDb.role.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting farm role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
