import { Column } from '@shared/types';
import slugify from 'slugify';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const restaurantColumns: Column[] = [
  { name: 'Restaurant Name', type: 'text', description: 'Name of the German restaurant' },
  { name: 'Address', type: 'text', description: 'Street address of the restaurant' },
  {
    name: 'Average Price (in USD)',
    type: 'number',
    description:
      'Average cost per person in USD. Google might give a range like $10-$20, take the average.',
  },
  { name: 'Ratings', type: 'number', description: 'Average customer rating out of 5' },
  { name: 'Review Count', type: 'number', description: 'Number of reviews on Google Maps' },
  {
    name: 'Special Features',
    type: 'text',
    description: 'Unique features or specialties of the restaurant',
  },
  { name: 'Website', type: 'link', description: "Link to the restaurant's official website" },
];

export const restaurantData = [
  {
    'Restaurant Name': 'Suppenküche',
    Address: '525 Laguna St, SF 94102',
    'Average Price (in USD)': 40,
    Ratings: 4.5,
    'Google Maps Review Count': 1837,
    'Special Features': 'Traditional Bavarian, Great Beer Selection, Cozy Atmosphere',
    Website: 'https://www.suppenkuche.com/',
  },
  {
    'Restaurant Name': 'Rosamunde Sausage Grill',
    Address: '2832 Mission St, SF 94110',
    'Average Price (in USD)': 15,
    Ratings: 4.5,
    'Google Maps Review Count': 1107,
    'Special Features': 'Gourmet Sausages, Craft Beers, Trendy',
    Website: 'https://www.rosamundesausagegrill.com/',
  },
  {
    'Restaurant Name': 'Radhaus',
    Address: '2 Marina Blvd, SF 94123',
    'Average Price (in USD)': 40,
    Ratings: 4.4,
    'Google Maps Review Count': 1308,
    'Special Features': 'Panoramic Bay Views, Live Music',
    Website: 'https://radhaussf.com/',
  },
  {
    'Restaurant Name': 'Biergarten',
    Address: '424 Octavia St, SF 94102',
    'Average Price (in USD)': 15,
    Ratings: 4.4,
    'Google Maps Review Count': 1105,
    'Special Features': 'Outdoor Seating, Communal Tables',
    Website: 'https://www.biergartensf.com/',
  },
  {
    'Restaurant Name': "Schroeder's",
    Address: '240 Front St, SF 94111',
    'Average Price (in USD)': 40,
    Ratings: 4.2,
    'Google Maps Review Count': 1214,
    'Special Features': 'Historic Beer Hall, Oktoberfest Parties',
    Website: 'https://www.schroederssf.com/',
  },
  {
    'Restaurant Name': "Leopold's",
    Address: '2400 Polk St, SF 94109',
    'Average Price (in USD)': 40,
    Ratings: 4.6,
    'Google Maps Review Count': 665,
    'Special Features': 'Austrian Fare, Alpine-Lodge Decor',
    Website: 'https://www.gasthausleopolds.com/',
  },
];

export async function createRestaurantTable(userId: string) {
  const name = 'German Restaurants in SF';
  // Create the table with columns
  const restaurantTable = await Table.create({
    name,
    description: 'List of German restaurants in San Francisco',
    columns: restaurantColumns,
    userId,
    slug: slugify(name).toLowerCase(),
  });

  // Create rows
  const rowPromises = restaurantData.map((data) => {
    return Row.create({
      tableId: restaurantTable._id,
      data,
      userId,
    });
  });

  await Promise.all(rowPromises);

  return restaurantTable;
}
