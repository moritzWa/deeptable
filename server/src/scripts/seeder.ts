import mongoose from 'mongoose';
import { User } from '../models/user';
import { createHardwareStartupsTable } from './seeds/consumerHardwareStartups';
import { createRestaurantTable } from './seeds/germanRestaurants';
import { createApiPricingTable } from './seeds/searchAiApiPricing';

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

// Seed database with all data
const seedDatabase = async () => {
  try {
    // Find or create a test user
    const yourEmail = 'wallawitsch@gmail.com';
    const user = await User.findOne({ email: yourEmail });

    if (!user) {
      throw new Error('user not found');
    }

    const userId = user._id.toString();

    // Create restaurant table and its rows
    const restaurantTable = await createRestaurantTable(userId);
    console.log(`Created table: ${restaurantTable.name} with ID: ${restaurantTable._id}`);
    const searchAiApiPricingTable = await createApiPricingTable(userId);
    console.log(
      `Created table: ${searchAiApiPricingTable.name} with ID: ${searchAiApiPricingTable._id}`
    );
    const consumerHardwareStartupsTable = await createHardwareStartupsTable(userId);
    console.log(
      `Created table: ${consumerHardwareStartupsTable.name} with ID: ${consumerHardwareStartupsTable._id}`
    );

    console.log('Database seeded successfully!');
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
