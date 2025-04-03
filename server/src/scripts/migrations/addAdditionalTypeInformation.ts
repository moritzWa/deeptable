import mongoose from 'mongoose';
import { Table } from '../../models/table';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || '');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Update additionalTypeInformation for all tables and columns
const updateAdditionalTypeInformation = async () => {
  try {
    console.log('Starting migration: Adding empty additionalTypeInformation to all columns');
    
    // Use updateMany with $set to set additionalTypeInformation to {} for all columns where it's null/undefined
    const result = await Table.updateMany(
      { "columns.additionalTypeInformation": { $exists: false } },
      { $set: { "columns.$[].additionalTypeInformation": {} } }
    );
    
    console.log(`Migration completed successfully!`);
    console.log(`Updated ${result.modifiedCount} tables`);
    
    // Additional pass to ensure all tables have additionalTypeInformation set to {} even if it already exists
    const allTablesResult = await Table.updateMany(
      {},
      { $set: { "columns.$[elem].additionalTypeInformation": {} } },
      { 
        arrayFilters: [{ "elem.additionalTypeInformation": { $ne: {} } }],
        multi: true
      }
    );
    
    console.log(`Additional pass: Updated ${allTablesResult.modifiedCount} more tables`);
    
  } catch (error: any) {
    console.error(`Error during migration: ${error.message}`);
  } finally {
    // Disconnect from database
    mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Run the migration
connectDB().then(() => {
  updateAdditionalTypeInformation();
});
