import mongoose from 'mongoose';
import { IColumn, Table } from '../models/table';
import { User } from '../models/user';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || '');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed database with restaurant table
const seedDatabase = async () => {
  try {
    // Find or create a test user

    const yourEmail = 'wallawitsch@gmail.com';
    const user = await User.findOne({ email: yourEmail });

    if (!user) {
      throw new Error('user not found');
    }

    const userId = user._id.toString();
    
    // Create restaurant table
    const restaurantColumns: IColumn[] = [
      { name: 'Restaurant Name', type: 'string', required: true },
      { name: 'Address', type: 'string', required: true },
      { name: 'Average Price (in USD)', type: 'number', required: false },
      { name: 'Ratings', type: 'number', required: false },
      { name: 'Review Count', type: 'number', required: false },
      { name: 'Special Features', type: 'string', required: false },
      { name: 'Website', type: 'string', required: false }
    ];
    
    const restaurantTable = await Table.create({
      name: 'SF German Restaurants',
      description: 'A collection of German restaurants in San Francisco',
      columns: restaurantColumns,
      userId
    });
    
    console.log(`Created table: ${restaurantTable.name} with ID: ${restaurantTable._id}`);
    
    console.log('Database seeded successfully!');
    console.log('To add rows to this table, run the rowSeeder.ts script');
    
  } catch (error: any) {
    console.error(`Error seeding database: ${error.message}`);
  } finally {
    // Disconnect from database
    mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Run the seeder
connectDB().then(() => {
  seedDatabase();
}); 