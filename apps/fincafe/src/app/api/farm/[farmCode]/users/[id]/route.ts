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
    const { 
      email, 
      name, 
      firstName,
      lastName,
      phone,
      birthDate,
      password, 
      roleId,
      // Address Information
      address,
      city,
      state,
      country,
      postalCode,
      // Emergency Contact
      emergencyContact,
      emergencyPhone,
      // Employment Information
      position,
      department,
      hireDate,
      // Additional Information
      nationality,
      idType,
      idNumber,
    } = body;

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

    const updateData: any = {};
    
    // Only add fields that are provided
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name || null;
    if (firstName !== undefined) updateData.firstName = firstName || null;
    if (lastName !== undefined) updateData.lastName = lastName || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (password) updateData.password = password;
    if (roleId !== undefined) updateData.roleId = roleId || null;
    
    // Address Information
    if (address !== undefined) updateData.address = address || null;
    if (city !== undefined) updateData.city = city || null;
    if (state !== undefined) updateData.state = state || null;
    if (country !== undefined) updateData.country = country || null;
    if (postalCode !== undefined) updateData.postalCode = postalCode || null;
    
    // Emergency Contact
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact || null;
    if (emergencyPhone !== undefined) updateData.emergencyPhone = emergencyPhone || null;
    
    // Employment Information
    if (position !== undefined) updateData.position = position || null;
    if (department !== undefined) updateData.department = department || null;
    if (hireDate !== undefined) updateData.hireDate = hireDate ? new Date(hireDate) : null;
    
    // Additional Information
    if (nationality !== undefined) updateData.nationality = nationality || null;
    if (idType !== undefined) updateData.idType = idType || null;
    if (idNumber !== undefined) updateData.idNumber = idNumber || null;

    const user = await farmDb.user.update({
      where: { id: params.id },
      data: updateData,
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
