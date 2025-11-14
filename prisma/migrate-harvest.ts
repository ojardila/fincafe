import { PrismaClient } from '@prisma/client';
import { getFarmDatabase } from '../apps/fincafe/src/lib/database';

const prisma = new PrismaClient();

async function applyHarvestMigration() {
  try {
    console.log('Fetching all active farms...');
    
    const farms = await prisma.farm.findMany({
      where: { isActive: true },
    });

    console.log(`Found ${farms.length} active farm(s)`);

    for (const farm of farms) {
      console.log(`\n🔄 Applying migration to farm: ${farm.name} (${farm.code})`);
      
      try {
        const farmDb = getFarmDatabase(farm.databaseName);

        // Check if table already exists
        const tableExists = await farmDb.$queryRaw<any[]>`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'HarvestCollection'
          );
        `;

        if (tableExists[0]?.exists) {
          console.log(`   ✅ HarvestCollection table already exists in ${farm.code}`);
          continue;
        }

        console.log(`   📝 Creating HarvestCollection table...`);

        // Create the HarvestCollection table
        await farmDb.$executeRaw`
          CREATE TABLE "HarvestCollection" (
            "id" TEXT NOT NULL,
            "plotId" TEXT NOT NULL,
            "cropTypeId" TEXT NOT NULL,
            "pickerName" TEXT NOT NULL,
            "kilograms" DOUBLE PRECISION NOT NULL,
            "collectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "HarvestCollection_pkey" PRIMARY KEY ("id")
          );
        `;

        console.log(`   📝 Creating indexes...`);

        // Create indexes
        await farmDb.$executeRaw`
          CREATE INDEX "HarvestCollection_plotId_idx" ON "HarvestCollection"("plotId");
        `;

        await farmDb.$executeRaw`
          CREATE INDEX "HarvestCollection_cropTypeId_idx" ON "HarvestCollection"("cropTypeId");
        `;

        await farmDb.$executeRaw`
          CREATE INDEX "HarvestCollection_collectionDate_idx" ON "HarvestCollection"("collectionDate");
        `;

        console.log(`   📝 Creating foreign keys...`);

        // Add foreign keys
        await farmDb.$executeRaw`
          ALTER TABLE "HarvestCollection" 
          ADD CONSTRAINT "HarvestCollection_plotId_fkey" 
          FOREIGN KEY ("plotId") REFERENCES "Plot"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        `;

        await farmDb.$executeRaw`
          ALTER TABLE "HarvestCollection" 
          ADD CONSTRAINT "HarvestCollection_cropTypeId_fkey" 
          FOREIGN KEY ("cropTypeId") REFERENCES "CropType"("id") 
          ON DELETE RESTRICT ON UPDATE CASCADE;
        `;

        console.log(`   ✅ Migration completed for ${farm.code}`);

      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log(`   ✅ HarvestCollection table already exists in ${farm.code}`);
        } else {
          console.error(`   ❌ Error migrating ${farm.code}:`, error.message);
        }
      }
    }

    console.log('\n✅ All migrations completed!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyHarvestMigration();
