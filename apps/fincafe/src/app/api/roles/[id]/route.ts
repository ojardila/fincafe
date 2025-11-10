import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/roles/[id] - Get a specific role by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(role, { status: 200 });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// PATCH /api/roles/[id] - Update a role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, permissionIds } = body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // If name is being updated, check if it's already taken
    if (name && name !== existingRole.name) {
      const nameTaken = await prisma.role.findUnique({
        where: { name },
      });

      if (nameTaken) {
        return NextResponse.json(
          { error: 'Role name is already taken' },
          { status: 409 }
        );
      }
    }

    // Update role with new permissions
    const role = await prisma.role.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        permissions: permissionIds
          ? {
              set: permissionIds.map((permId: string) => ({ id: permId })),
            }
          : undefined,
      },
      include: {
        permissions: true,
      },
    });

    return NextResponse.json(role, { status: 200 });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE /api/roles/[id] - Delete a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Prevent deletion if users are assigned to this role
    if (existingRole._count.users > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete role. ${existingRole._count.users} user(s) are assigned to this role.`,
        },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Role deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
