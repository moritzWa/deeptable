import { Column } from '@shared/types';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const travelLocationsColumns: Column[] = [
  { name: 'location', type: 'text', description: 'Travel destination' },
  { name: 'travel time', type: 'text', description: 'Travel duration from SFO' },
  { name: 'travel cost (USD)', type: 'number', description: 'Flight cost from SFO around April 30th' },
  { name: 'Country cost of living', type: 'number', description: 'Cost of living index' },
  { name: 'Temp (High) (F)', type: 'number', description: 'High temperature in Fahrenheit' },
  { name: 'Temp (Low) (F)', type: 'number', description: 'Low temperature in Fahrenheit' },
  { name: 'sunnyness', type: 'number', description: 'Sunshine rating out of 10' },
  { name: 'humidity', type: 'text', description: 'Average humidity percentage' },
];

export const travelLocationsData = [
  {
    location: 'costa rica, nosara',
    'travel time': '7 hours flight + 3 hour drive',
    'travel cost (USD)': 464,
    'Country cost of living': 50.1,
    'Temp (High) (F)': 93,
    'Temp (Low) (F)': 78,
    'sunnyness': 10.4,
    'humidity': '59%',
  },
  {
    location: 'miami, FL',
    'travel time': '6 hours',
    'travel cost (USD)': 230,
    'Country cost of living': 64.9,
    'Temp (High) (F)': 76,
    'Temp (Low) (F)': 70,
    'sunnyness': 9,
    'humidity': '68%',
  },
  {
    location: 'barcelona',
    'travel time': '14 hours',
    'travel cost (USD)': 817,
    'Country cost of living': 43.5,
    'Temp (High) (F)': 63,
    'Temp (Low) (F)': 51,
    'sunnyness': 6,
    'humidity': '55%',
  },
  {
    location: 'belize',
    'travel time': '6 hours',
    'travel cost (USD)': 866,
    'Country cost of living': 41.4,
    'Temp (High) (F)': 82,
    'Temp (Low) (F)': 74,
    'sunnyness': 8,
    'humidity': '71%',
  },
  {
    location: 'yosemite',
    'travel time': '3 hours (drive)',
    'travel cost (USD)': 0,
    'Country cost of living': 64.9,
    'Temp (High) (F)': 57,
    'Temp (Low) (F)': 33,
    'sunnyness': 9,
    'humidity': '82%',
  },
];

export async function createMayTravelLocationsTable(userId: string) {
  // Create the table with columns
  const travelLocationsTable = await Table.create({
    name: 'May Travel Locations',
    description: 'Best destinations to travel to from San Francisco in May',
    columns: travelLocationsColumns,
    userId,
  });

  // Create rows
  const rowPromises = travelLocationsData.map((data) => {
    return Row.create({
      tableId: travelLocationsTable._id,
      data,
      userId,
    });
  });

  await Promise.all(rowPromises);

  return travelLocationsTable;
} 