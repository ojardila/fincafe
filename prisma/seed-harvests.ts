import { PrismaClient } from '@prisma/client';
import { getFarmDatabase } from '../apps/fincafe/src/lib/database';

const prisma = new PrismaClient();

async function seedHarvestData() {
  try {
    console.log('🌱 Starting harvest data seeding...');

    // Get the demo farm
    const farm = await prisma.farm.findUnique({
      where: { code: 'demo-farm' },
    });

    if (!farm) {
      console.error('❌ Demo farm not found');
      process.exit(1);
    }

    const farmDb = getFarmDatabase(farm.databaseName);

    // Get or create employee role
    let employeeRole = await farmDb.role.findUnique({
      where: { name: 'employee' },
    });

    if (!employeeRole) {
      employeeRole = await farmDb.role.create({
        data: {
          name: 'employee',
          description: 'Farm employee',
        },
      });
      console.log('✅ Created employee role');
    }

    // Create employees
    const employeeNames = [
      { firstName: 'Juan', lastName: 'Pérez', email: 'juan.perez@fincafe.com' },
      { firstName: 'María', lastName: 'González', email: 'maria.gonzalez@fincafe.com' },
      { firstName: 'Carlos', lastName: 'Rodríguez', email: 'carlos.rodriguez@fincafe.com' },
      { firstName: 'Ana', lastName: 'Martínez', email: 'ana.martinez@fincafe.com' },
      { firstName: 'Luis', lastName: 'López', email: 'luis.lopez@fincafe.com' },
      { firstName: 'Diana', lastName: 'Sánchez', email: 'diana.sanchez@fincafe.com' },
      { firstName: 'Pedro', lastName: 'Ramírez', email: 'pedro.ramirez@fincafe.com' },
      { firstName: 'Laura', lastName: 'Torres', email: 'laura.torres@fincafe.com' },
    ];

    const employees = [];
    for (const emp of employeeNames) {
      const existing = await farmDb.user.findUnique({
        where: { email: emp.email },
      });

      if (!existing) {
        const user = await farmDb.user.create({
          data: {
            email: emp.email,
            firstName: emp.firstName,
            lastName: emp.lastName,
            name: `${emp.firstName} ${emp.lastName}`,
            password: 'password123', // In production, this should be hashed
            roleId: employeeRole.id,
          },
        });
        employees.push(user);
        console.log(`✅ Created employee: ${emp.firstName} ${emp.lastName}`);
      } else {
        employees.push(existing);
      }
    }

    // Get or create crop type
    let coffeeType = await farmDb.cropType.findFirst({
      where: { name: 'Café' },
    });

    if (!coffeeType) {
      coffeeType = await farmDb.cropType.create({
        data: {
          name: 'Café',
          description: 'Coffee plants',
        },
      });
      console.log('✅ Created Coffee crop type');
    }

    // Create varieties
    const varieties = ['Arábica', 'Robusta', 'Castillo', 'Caturra'];
    const createdVarieties = [];
    
    for (const varName of varieties) {
      const existing = await farmDb.variety.findFirst({
        where: { 
          name: varName,
          cropTypeId: coffeeType.id,
        },
      });

      if (!existing) {
        const variety = await farmDb.variety.create({
          data: {
            name: varName,
            cropTypeId: coffeeType.id,
          },
        });
        createdVarieties.push(variety);
        console.log(`✅ Created variety: ${varName}`);
      } else {
        createdVarieties.push(existing);
      }
    }

    // Create plots
    const plotNames = [
      { name: 'Lote La Esperanza', area: 2.5, dept: 'Antioquia', muni: 'Medellín' },
      { name: 'Lote El Paraíso', area: 3.0, dept: 'Caldas', muni: 'Manizales' },
      { name: 'Lote San José', area: 1.8, dept: 'Risaralda', muni: 'Pereira' },
      { name: 'Lote La Cascada', area: 2.2, dept: 'Quindío', muni: 'Armenia' },
      { name: 'Lote El Mirador', area: 2.8, dept: 'Antioquia', muni: 'Medellín' },
      { name: 'Lote Las Palmas', area: 1.5, dept: 'Caldas', muni: 'Chinchiná' },
    ];

    const plots = [];
    for (const plotData of plotNames) {
      const existing = await farmDb.plot.findFirst({
        where: { name: plotData.name },
      });

      if (!existing) {
        const plot = await farmDb.plot.create({
          data: {
            name: plotData.name,
            totalArea: plotData.area,
            department: plotData.dept,
            municipality: plotData.muni,
            isActive: true,
          },
        });

        // Add crop to plot
        await farmDb.plotCrop.create({
          data: {
            plotId: plot.id,
            cropTypeId: coffeeType.id,
            varietyId: createdVarieties[Math.floor(Math.random() * createdVarieties.length)].id,
          },
        });

        plots.push(plot);
        console.log(`✅ Created plot: ${plotData.name}`);
      } else {
        plots.push(existing);
      }
    }

    // Create harvest collections for the current week (Monday to Sunday)
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(8, 0, 0, 0);

    console.log('\n🌾 Creating harvest collections for current week...');

    let harvestCount = 0;

    // Generate harvests for each day of the week
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const harvestDate = new Date(monday);
      harvestDate.setDate(monday.getDate() + dayOffset);

      // Random number of employees working each day (4-6)
      const workingEmployees = employees
        .sort(() => 0.5 - Math.random())
        .slice(0, 4 + Math.floor(Math.random() * 3));

      for (const employee of workingEmployees) {
        // Each employee harvests from 1-3 plots per day
        const numPlots = 1 + Math.floor(Math.random() * 3);
        const selectedPlots = plots
          .sort(() => 0.5 - Math.random())
          .slice(0, numPlots);

        for (const plot of selectedPlots) {
          // Random kilograms between 15 and 85
          const kilograms = 15 + Math.random() * 70;

          await farmDb.harvestCollection.create({
            data: {
              plotId: plot.id,
              cropTypeId: coffeeType.id,
              pickerName: `${employee.firstName} ${employee.lastName}`,
              kilograms: Math.round(kilograms * 10) / 10, // Round to 1 decimal
              collectionDate: harvestDate,
              notes: `Harvest from ${plot.name}`,
            },
          });

          harvestCount++;
        }
      }
    }

    console.log(`\n✅ Created ${harvestCount} harvest collections`);
    console.log(`✅ Employees: ${employees.length}`);
    console.log(`✅ Plots: ${plots.length}`);
    console.log(`✅ Varieties: ${createdVarieties.length}`);
    console.log('\n🎉 Harvest data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding harvest data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedHarvestData();
