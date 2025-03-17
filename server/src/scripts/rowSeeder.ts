import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Row } from '../models/row';
import { Table } from '../models/table';
import { User } from '../models/user';

// Load environment variables
dotenv.config();

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

// Seed database with restaurant rows
const seedRows = async () => {
  try {
    // Find user by email
    const yourEmail = 'wallawitsch@gmail.com';
    const user = await User.findOne({ email: yourEmail });

    if (!user) {
      throw new Error('User not found');
    }
    
    const userId = user._id.toString();
    
    // Find restaurant table
    const restaurantTable = await Table.findOne({ 
      name: 'SF German Restaurants',
      userId 
    });
    
    if (!restaurantTable) {
      console.error('Restaurant table not found. Please run seeder.ts first.');
      return;
    }
    
    // Restaurant data from CSV
    const restaurantData = [
      {
        "Restaurant Name": "Suppenküche",
        "Address": "525 Laguna St, SF 94102",
        "Average Price (in USD)": 40,
        "Ratings": 4.5,
        "Review Count": 1837,
        "Special Features": "Traditional Bavarian, Great Beer Selection, Cozy Atmosphere",
        "Website": "https://www.suppenkuche.com/"
      },
      {
        "Restaurant Name": "Rosamunde Sausage Grill",
        "Address": "2832 Mission St, SF 94110",
        "Average Price (in USD)": 15,
        "Ratings": 4.5,
        "Review Count": 1107,
        "Special Features": "Gourmet Sausages, Craft Beers, Trendy",
        "Website": "https://www.rosamundesausagegrill.com/"
      },
      {
        "Restaurant Name": "Radhaus",
        "Address": "2 Marina Blvd, SF 94123",
        "Average Price (in USD)": 40,
        "Ratings": 4.4,
        "Review Count": 1308,
        "Special Features": "Panoramic Bay Views, Live Music",
        "Website": "https://radhaussf.com/"
      },
      {
        "Restaurant Name": "Biergarten",
        "Address": "424 Octavia St, SF 94102",
        "Average Price (in USD)": 15,
        "Ratings": 4.4,
        "Review Count": 1105,
        "Special Features": "Outdoor Seating, Communal Tables",
        "Website": "https://biergarten.cuba-cafe.com/"
      },
      {
        "Restaurant Name": "Schroeder's",
        "Address": "240 Front St, SF 94111",
        "Average Price (in USD)": 40,
        "Ratings": 4.2,
        "Review Count": 1214,
        "Special Features": "Historic Beer Hall, Oktoberfest Parties",
        "Website": "https://www.schroederssf.com/"
      },
      {
        "Restaurant Name": "Leopold's",
        "Address": "2400 Polk St, SF 94109",
        "Average Price (in USD)": 40,
        "Ratings": 4.6,
        "Review Count": 665,
        "Special Features": "Austrian Fare, Alpine-Lodge Decor",
        "Website": "https://www.gasthausleopolds.com/"
      }
    ];
    
    // Create rows
    const rowPromises = restaurantData.map(data => {
      return Row.create({
        tableId: restaurantTable._id,
        data,
        userId
      });
    });
    
    await Promise.all(rowPromises);
    
    console.log(`Added ${restaurantData.length} rows to ${restaurantTable.name} table`);
    console.log('Row seeding completed successfully!');
    
  } catch (error: any) {
    console.error(`Error seeding rows: ${error.message}`);
  } finally {
    // Disconnect from database
    mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Run the seeder
connectDB().then(() => {
  seedRows();
}); 