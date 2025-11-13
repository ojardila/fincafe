import { createFarmDatabase, initializeFarmDatabase } from '../apps/fincafe/src/lib/database';

async function main() {
  const databaseName = 'customer_demo_farm';
  
  console.log(`Initializing farm database: ${databaseName}`);
  
  try {
    // Create the database
    await createFarmDatabase(databaseName);
    
    // Initialize with schema
    await initializeFarmDatabase(databaseName);
    
    console.log('✓ Demo farm database initialized successfully!');
  } catch (error) {
    console.error('Error initializing farm database:', error);
    process.exit(1);
  }
}

main();
