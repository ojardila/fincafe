import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';
import { getFarmDatabase } from '../../../../../../../lib/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ farmCode: string; employeeId: string }> }
) {
  try {
    const { farmCode, employeeId } = await params;

    // Get farm
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

    // Get employee details
    const employee = await farmDb.user.findUnique({
      where: { id: employeeId },
      include: {
        role: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get employee name for filtering harvests
    const employeeName = employee.firstName && employee.lastName
      ? `${employee.firstName} ${employee.lastName}`
      : employee.name || employee.email;

    // Fetch all harvest collections for this employee
    const harvests = await farmDb.harvestCollection.findMany({
      where: {
        pickerName: employeeName,
      },
      include: {
        plot: true,
        cropType: true,
      },
      orderBy: {
        collectionDate: 'desc',
      },
    });

    // Calculate overall statistics
    const totalKg = harvests.reduce((sum, h) => sum + h.kilograms, 0);
    const totalCollections = harvests.length;
    const averageKgPerCollection = totalCollections > 0 ? totalKg / totalCollections : 0;

    // Get unique plots and crop types
    const uniquePlots = new Set(harvests.map(h => h.plotId));
    const uniqueCropTypes = new Set(harvests.map(h => h.cropTypeId));

    // Get first and last collection dates
    const firstCollection = harvests.length > 0 
      ? harvests[harvests.length - 1].collectionDate 
      : null;
    const lastCollection = harvests.length > 0 
      ? harvests[0].collectionDate 
      : null;

    // Calculate statistics by crop type
    const cropTypeMap = new Map<string, {
      cropTypeId: string;
      cropTypeName: string;
      totalKg: number;
      collectionsCount: number;
      plots: Set<string>;
    }>();

    harvests.forEach((harvest) => {
      if (!cropTypeMap.has(harvest.cropType.name)) {
        cropTypeMap.set(harvest.cropType.name, {
          cropTypeId: harvest.cropTypeId,
          cropTypeName: harvest.cropType.name,
          totalKg: 0,
          collectionsCount: 0,
          plots: new Set(),
        });
      }
      const stat = cropTypeMap.get(harvest.cropType.name);
      if (stat) {
        stat.totalKg += harvest.kilograms;
        stat.collectionsCount += 1;
        stat.plots.add(harvest.plotId);
      }
    });

    const cropTypeStats = Array.from(cropTypeMap.values()).map(stat => ({
      cropTypeId: stat.cropTypeId,
      cropTypeName: stat.cropTypeName,
      totalKg: stat.totalKg,
      collectionsCount: stat.collectionsCount,
      averageKgPerCollection: stat.totalKg / stat.collectionsCount,
      plotsCount: stat.plots.size,
    }));

    // Calculate statistics by plot
    const plotMap = new Map<string, {
      plotId: string;
      plotName: string;
      totalKg: number;
      collectionsCount: number;
      cropTypes: Set<string>;
    }>();

    harvests.forEach((harvest) => {
      if (!plotMap.has(harvest.plot.name)) {
        plotMap.set(harvest.plot.name, {
          plotId: harvest.plotId,
          plotName: harvest.plot.name,
          totalKg: 0,
          collectionsCount: 0,
          cropTypes: new Set(),
        });
      }
      const stat = plotMap.get(harvest.plot.name);
      if (stat) {
        stat.totalKg += harvest.kilograms;
        stat.collectionsCount += 1;
        stat.cropTypes.add(harvest.cropTypeId);
      }
    });

    const plotStats = Array.from(plotMap.values()).map(stat => ({
      plotId: stat.plotId,
      plotName: stat.plotName,
      totalKg: stat.totalKg,
      collectionsCount: stat.collectionsCount,
      averageKgPerCollection: stat.totalKg / stat.collectionsCount,
      cropTypesCount: stat.cropTypes.size,
    }));

    // Calculate weekly statistics (last 12 weeks)
    const weeklyMap = new Map<string, {
      weekStart: Date;
      weekLabel: string;
      totalKg: number;
      collectionsCount: number;
    }>();

    harvests.forEach((harvest) => {
      const date = new Date(harvest.collectionDate);
      // Get the Monday of the week
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        const weekEnd = new Date(monday);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weeklyMap.set(weekKey, {
          weekStart: monday,
          weekLabel: `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          totalKg: 0,
          collectionsCount: 0,
        });
      }
      
      const weeklyStat = weeklyMap.get(weekKey);
      if (weeklyStat) {
        weeklyStat.totalKg += harvest.kilograms;
        weeklyStat.collectionsCount += 1;
      }
    });

    // Convert to array, sort by date, and take last 12 weeks
    const weeklyStats = Array.from(weeklyMap.values())
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
      .slice(-12)
      .map(stat => ({
        weekLabel: stat.weekLabel,
        totalKg: stat.totalKg,
        collectionsCount: stat.collectionsCount,
        averageKgPerCollection: stat.totalKg / stat.collectionsCount,
      }));

    // Recent collections (last 10)
    const recentCollections = harvests.slice(0, 10).map(h => ({
      id: h.id,
      collectionDate: h.collectionDate.toISOString(),
      kilograms: h.kilograms,
      plotName: h.plot.name,
      cropTypeName: h.cropType.name,
    }));

    return NextResponse.json({
      employee: {
        id: employee.id,
        name: employeeName,
        email: employee.email,
        role: employee.role?.name || 'Employee',
        createdAt: employee.createdAt.toISOString(),
      },
      overallStats: {
        totalKg,
        totalCollections,
        averageKgPerCollection,
        uniqueplotsCount: uniquePlots.size,
        uniqueCropTypesCount: uniqueCropTypes.size,
        firstCollection: firstCollection?.toISOString() || null,
        lastCollection: lastCollection?.toISOString() || null,
      },
      cropTypeStats,
      plotStats,
      weeklyStats,
      recentCollections,
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee statistics' },
      { status: 500 }
    );
  }
}
