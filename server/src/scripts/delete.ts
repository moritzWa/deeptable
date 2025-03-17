import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Row } from '../models/row';
import { Table } from '../models/table';

// Load environment variables
dotenv.config();

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

// Delete all collections except users
const deleteCollections = async () => {
  try {
    // Delete all rows
    const rowResult = await Row.deleteMany({});
    console.log(`Deleted ${rowResult.deletedCount} rows`);
    
    // Delete all tables
    const tableResult = await Table.deleteMany({});
    console.log(`Deleted ${tableResult.deletedCount} tables`);
    
    // Add other collections to delete here
    
    // Delete each remaining collection
    
    console.log('Database cleanup completed successfully!');
    
  } catch (error: any) {
    console.error(`Error deleting collections: ${error.message}`);
  } finally {
    // Disconnect from database
    mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Run the delete script
connectDB().then(() => {
  // Confirm with console before proceeding
  console.log('WARNING: This will delete all data except users!');
  console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
  
  setTimeout(() => {
    deleteCollections();
  }, 5000);
}); 