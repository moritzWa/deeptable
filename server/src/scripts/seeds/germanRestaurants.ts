import { Column } from '@shared/types';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const restaurantColumns: Column[] = [
  {
    columnId: randomUUID(),
    name: 'Restaurant Name',
    type: 'text',
    description: 'Name of the German restaurant',
  },
  {
    columnId: randomUUID(),
    name: 'Address',
    type: 'text',
    description: 'Street address of the restaurant',
  },
  {
    columnId: randomUUID(),
    name: 'Average Price (in USD)',
    type: 'number',
    description:
      'Average cost per person in USD. Google might give a range like $10-$20, take the average.',
  },
  {
    columnId: randomUUID(),
    name: 'Ratings',
    type: 'number',
    description: 'Average customer rating out of 5',
  },
  {
    columnId: randomUUID(),
    name: 'Review Count',
    type: 'number',
    description: 'Number of reviews on Google Maps',
  },
  {
    columnId: randomUUID(),
    name: 'Special Features',
    type: 'text',
    description: 'Unique features or specialties of the restaurant',
  },
  {
    columnId: randomUUID(),
    name: 'Website',
    type: 'link',
    description: "Link to the restaurant's official website",
  },
];

// Create a mapping of column names to column IDs for data transformation
const columnNameToId = Object.fromEntries(restaurantColumns.map((col) => [col.name, col.columnId]));

// Transform the restaurant data to use column IDs instead of names
export const restaurantData = [
  {
    [columnNameToId['Restaurant Name']]: 'Suppenküche',
    [columnNameToId['Address']]: '525 Laguna St, SF 94102',
    [columnNameToId['Average Price (in USD)']]: 40,
    [columnNameToId['Ratings']]: 4.5,
    [columnNameToId['Review Count']]: 1837,
    [columnNameToId['Special Features']]:
      'Traditional Bavarian, Great Beer Selection, Cozy Atmosphere',
    [columnNameToId['Website']]: 'https://www.suppenkuche.com/',
  },
  {
    [columnNameToId['Restaurant Name']]: 'Rosamunde Sausage Grill',
    [columnNameToId['Address']]: '2832 Mission St, SF 94110',
    [columnNameToId['Average Price (in USD)']]: 15,
    [columnNameToId['Ratings']]: 4.5,
    [columnNameToId['Review Count']]: 1107,
    [columnNameToId['Special Features']]: 'Gourmet Sausages, Craft Beers, Trendy',
    [columnNameToId['Website']]: 'https://www.rosamundesausagegrill.com/',
  },
  {
    [columnNameToId['Restaurant Name']]: 'Radhaus',
    [columnNameToId['Address']]: '2 Marina Blvd, SF 94123',
    [columnNameToId['Average Price (in USD)']]: 40,
    [columnNameToId['Ratings']]: 4.4,
    [columnNameToId['Review Count']]: 1308,
    [columnNameToId['Special Features']]: 'Panoramic Bay Views, Live Music',
    [columnNameToId['Website']]: 'https://radhaussf.com/',
  },
  {
    [columnNameToId['Restaurant Name']]: 'Biergarten',
    [columnNameToId['Address']]: '424 Octavia St, SF 94102',
    [columnNameToId['Average Price (in USD)']]: 15,
    [columnNameToId['Ratings']]: 4.4,
    [columnNameToId['Review Count']]: 1105,
    [columnNameToId['Special Features']]: 'Outdoor Seating, Communal Tables',
    [columnNameToId['Website']]: 'https://www.biergartensf.com/',
  },
  {
    [columnNameToId['Restaurant Name']]: "Schroeder's",
    [columnNameToId['Address']]: '240 Front St, SF 94111',
    [columnNameToId['Average Price (in USD)']]: 40,
    [columnNameToId['Ratings']]: 4.2,
    [columnNameToId['Review Count']]: 1214,
    [columnNameToId['Special Features']]: 'Historic Beer Hall, Oktoberfest Parties',
    [columnNameToId['Website']]: 'https://www.schroederssf.com/',
  },
  {
    [columnNameToId['Restaurant Name']]: "Leopold's",
    [columnNameToId['Address']]: '2400 Polk St, SF 94109',
    [columnNameToId['Average Price (in USD)']]: 40,
    [columnNameToId['Ratings']]: 4.6,
    [columnNameToId['Review Count']]: 665,
    [columnNameToId['Special Features']]: 'Austrian Fare, Alpine-Lodge Decor',
    [columnNameToId['Website']]: 'https://www.gasthausleopolds.com/',
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
    sharingStatus: 'public',
    slug: slugify(name).toLowerCase(),
  });

  // Create rows with the data (already using column IDs)
  const rowPromises = restaurantData.map((data, index) => {
    return Row.create({
      tableId: restaurantTable._id,
      data: data, // Data is already using column IDs, no need to transform
      userId,
      index,
    });
  });

  await Promise.all(rowPromises);

  return restaurantTable;
}
