import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/permissions - Get all permissions
export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      include: {
        _count: {
          select: { roles: true },
        },
      },
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
      ],
    });

    return NextResponse.json(permissions, { status: 200 });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
