import { NextRequest, NextResponse } from 'next/server';
import { getFarmDatabase } from '@/lib/database';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmCode: string }> }
) {
  try {
    const { farmCode } = await params;
    
    // Get farm information from main database
    const farm = await prisma.farm.findUnique({
      where: { code: farmCode },
    });

    if (!farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    // Get farm database connection
    const farmDb = getFarmDatabase(farm.databaseName);

    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const cropTypeId = searchParams.get('cropTypeId');
    const plotId = searchParams.get('plotId');

    // Build where clause for date filtering
    const where: any = {};
    if (startDate || endDate) {
      where.collectionDate = {};
      if (startDate) {
        where.collectionDate.gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to include the end date
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.collectionDate.lt = end;
      }
    }
    
    // Add crop type filter
    if (cropTypeId) {
      where.cropTypeId = cropTypeId;
    }

    // Add plot filter
    if (plotId) {
      where.plotId = plotId;
    }

    // Fetch all harvest collections with related data
    const harvests = await farmDb.harvestCollection.findMany({
      where,
      include: {
        plot: true,
        cropType: true,
      },
    });

    // Calculate employee statistics
    const employeeMap = new Map<string, {
      pickerName: string;
      totalKg: number;
      collectionsCount: number;
      plots: Set<string>;
      lastCollectionDate: Date;
    }>();

    // Calculate crop type statistics
    const cropTypeMap = new Map<string, {
      cropTypeName: string;
      totalKg: number;
      collectionsCount: number;
      plots: Set<string>;
      employees: Set<string>;
    }>();

    // Process each harvest
    harvests.forEach((harvest) => {
      // Employee stats
      if (!employeeMap.has(harvest.pickerName)) {
        employeeMap.set(harvest.pickerName, {
          pickerName: harvest.pickerName,
          totalKg: 0,
          collectionsCount: 0,
          plots: new Set(),
          lastCollectionDate: new Date(harvest.collectionDate),
        });
      }
      const employeeStat = employeeMap.get(harvest.pickerName);
      if (employeeStat) {
        employeeStat.totalKg += harvest.kilograms;
        employeeStat.collectionsCount += 1;
        employeeStat.plots.add(harvest.plotId);
        if (new Date(harvest.collectionDate) > employeeStat.lastCollectionDate) {
          employeeStat.lastCollectionDate = new Date(harvest.collectionDate);
        }
      }

      // Crop type stats
      if (!cropTypeMap.has(harvest.cropType.name)) {
        cropTypeMap.set(harvest.cropType.name, {
          cropTypeName: harvest.cropType.name,
          totalKg: 0,
          collectionsCount: 0,
          plots: new Set(),
          employees: new Set(),
        });
      }
      const cropTypeStat = cropTypeMap.get(harvest.cropType.name);
      if (cropTypeStat) {
        cropTypeStat.totalKg += harvest.kilograms;
        cropTypeStat.collectionsCount += 1;
        cropTypeStat.plots.add(harvest.plotId);
        cropTypeStat.employees.add(harvest.pickerName);
      }
    });

    // Convert maps to arrays with calculated averages
    const employeeStats = Array.from(employeeMap.values()).map((stat) => ({
      pickerName: stat.pickerName,
      totalKg: stat.totalKg,
      collectionsCount: stat.collectionsCount,
      averageKgPerCollection: stat.totalKg / stat.collectionsCount,
      plotsCount: stat.plots.size,
      lastCollectionDate: stat.lastCollectionDate.toISOString(),
    }));

    const cropTypeStats = Array.from(cropTypeMap.values()).map((stat) => ({
      cropTypeName: stat.cropTypeName,
      totalKg: stat.totalKg,
      collectionsCount: stat.collectionsCount,
      averageKgPerCollection: stat.totalKg / stat.collectionsCount,
      plotsCount: stat.plots.size,
      employeesCount: stat.employees.size,
    }));

    // Calculate overview statistics
    const uniquePlots = new Set(harvests.map((h) => h.plotId));
    const overviewStats = {
      totalKg: harvests.reduce((sum, h) => sum + h.kilograms, 0),
      totalCollections: harvests.length,
      totalEmployees: employeeMap.size,
      totalCropTypes: cropTypeMap.size,
      totalPlots: uniquePlots.size,
      averageKgPerCollection: harvests.length > 0 
        ? harvests.reduce((sum, h) => sum + h.kilograms, 0) / harvests.length
        : 0,
    };

    return NextResponse.json({
      employeeStats,
      cropTypeStats,
      overviewStats,
    });
  } catch (error) {
    console.error('Error fetching harvest stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch harvest statistics' },
      { status: 500 }
    );
  }
}
