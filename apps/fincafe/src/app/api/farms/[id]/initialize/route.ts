import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import {
  createFarmDatabase,
  initializeFarmDatabase,
} from '../../../../../lib/database';

// POST /api/farms/[id]/initialize - Initialize farm database
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the farm
    const farm = await prisma.farm.findUnique({
      where: { id: params.id },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    // Create the database
    await createFarmDatabase(farm.databaseName);

    // Initialize with schema
    await initializeFarmDatabase(farm.databaseName);

    return NextResponse.json({
      message: 'Farm database initialized successfully',
      databaseName: farm.databaseName,
    });
  } catch (error) {
    console.error('Error initializing farm database:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to initialize farm database: ${errorMessage}` },
      { status: 500 }
    );
  }
}
