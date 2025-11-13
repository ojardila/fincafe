import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFarmDatabase } from '@/lib/database';

// GET /api/farm/[farmCode]/profile - Get current user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string }> }
) {
  try {
    const { farmCode } = await params;
    // Verify farm exists
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    if (!farm.isActive) {
      return NextResponse.json({ error: 'Farm is not active' }, { status: 403 });
    }

    // TODO: Get user ID from session/token
    // For now, get the first user in the farm database for testing
    const farmDb = getFarmDatabase(farm.databaseName);

    // Get the first user (for testing - in production use session)
    const firstUser = await farmDb.user.findFirst({
      select: {
        id: true,
      },
    });

    if (!firstUser) {
      return NextResponse.json({ error: 'No users found in farm' }, { status: 404 });
    }

    const userId = request.headers.get('x-user-id') || firstUser.id;

    const user = await farmDb.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthDate: true,
        description: true,
        profilePicture: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        emergencyContact: true,
        emergencyPhone: true,
        position: true,
        department: true,
        hireDate: true,
        nationality: true,
        idNumber: true,
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/farm/[farmCode]/profile - Update current user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string }> }
) {
  try {
    const { farmCode } = await params;
    const body = await request.json();
    const { 
      username, firstName, lastName, phone, birthDate, description, profilePicture,
      address, city, state, country, postalCode,
      emergencyContact, emergencyPhone,
      position, department, hireDate,
      nationality, idNumber
    } = body;

    // Verify farm exists
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    if (!farm.isActive) {
      return NextResponse.json({ error: 'Farm is not active' }, { status: 403 });
    }

    // TODO: Get user ID from session/token
    // For now, get the first user in the farm database for testing
    const farmDb = getFarmDatabase(farm.databaseName);

    // Get the first user (for testing - in production use session)
    const firstUser = await farmDb.user.findFirst({
      select: {
        id: true,
      },
    });

    if (!firstUser) {
      return NextResponse.json({ error: 'No users found in farm' }, { status: 404 });
    }

    const userId = request.headers.get('x-user-id') || firstUser.id;

    const updatedUser = await farmDb.user.update({
      where: { id: userId },
      data: {
        ...(username !== undefined && { username }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
        ...(description !== undefined && { description }),
        ...(profilePicture !== undefined && { profilePicture }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(country !== undefined && { country }),
        ...(postalCode !== undefined && { postalCode }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(emergencyPhone !== undefined && { emergencyPhone }),
        ...(position !== undefined && { position }),
        ...(department !== undefined && { department }),
        ...(hireDate !== undefined && { hireDate: hireDate ? new Date(hireDate) : null }),
        ...(nationality !== undefined && { nationality }),
        ...(idNumber !== undefined && { idNumber }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthDate: true,
        description: true,
        profilePicture: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        emergencyContact: true,
        emergencyPhone: true,
        position: true,
        department: true,
        hireDate: true,
        nationality: true,
        idNumber: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
