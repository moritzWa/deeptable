import { Column } from '@shared/types';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const restaurantColumns: Column[] = [
  { name: 'Restaurant Name', type: 'text', required: true },
  { name: 'Address', type: 'text', required: true },
  { name: 'Average Price (in USD)', type: 'number', required: false },
  { name: 'Ratings', type: 'number', required: false },
  { name: 'Google Maps Review Count', type: 'number', required: false },
  { name: 'Special Features', type: 'text', required: false },
  { name: 'Website', type: 'link', required: false },
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
    Website: 'https://biergarten.cuba-cafe.com/',
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
  // Create the table with columns
  const restaurantTable = await Table.create({
    name: 'SF German Restaurants',
    description: 'A collection of German restaurants in San Francisco',
    columns: restaurantColumns,
    userId,
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
