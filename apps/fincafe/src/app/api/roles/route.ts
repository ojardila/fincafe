import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/roles - Get all roles with their permissions
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(roles, { status: 200 });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissionIds } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 }
      );
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: permissionIds
          ? {
              connect: permissionIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        permissions: true,
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}
