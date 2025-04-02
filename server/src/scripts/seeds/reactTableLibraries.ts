import { Column } from '@shared/types';
import slugify from 'slugify';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const reactTableColumns: Column[] = [
  { name: 'Library', type: 'text', description: 'Name of the React table library' },
  { name: 'Weekly Downloads', type: 'number', description: 'Number of weekly downloads from NPM' },
  { name: 'GitHub Stars', type: 'number', description: 'Number of stars on GitHub repository' },
  {
    name: 'Last Updated (days ago)',
    type: 'number',
    description: 'Days since the last update to the library on NPM',
  },
  { name: 'Size (KB)', type: 'number', description: 'Size of the library in kilobytes, unpacked' },
  { name: 'Use Case', type: 'text', description: 'Primary use cases for the library' },
  {
    name: 'Homepage',
    type: 'link',
    description: 'Link to the library website/documentation, otherwise NPM or Github',
  },
  { name: 'NPM Link', type: 'link', description: 'Link to the NPM package page' },
  { name: 'Github Link', type: 'link', description: 'Link to the GitHub repository' },
];

export const reactTableData = [
  {
    Library: 'React Table (TanStack Table)',
    'Weekly Downloads': 3277189,
    'GitHub Stars': 26100,
    'Last Updated (days ago)': 61,
    'Size (KB)': 761,
    'Use Case':
      'Enterprise applications, large datasets, complex data manipulation, financial dashboards',
    Homepage: 'https://tanstack.com/table/latest',
    'NPM Link': 'https://www.npmjs.com/package/@tanstack/react-table',
    'Github Link': 'https://github.com/TanStack/table',
  },
  {
    Library: 'ag-grid-react',
    'Weekly Downloads': 57940,
    'GitHub Stars': 13600,
    'Last Updated (days ago)': 3,
    'Size (KB)': 619,
    'Use Case':
      'Simple to complex tables, customizable UI, data grids, sorting, filtering, pagination',
    Homepage: 'https://www.ag-grid.com/react-data-grid',
    'NPM Link': 'https://www.npmjs.com/package/ag-grid-react',
    'Github Link': 'https://github.com/ag-grid/ag-grid',
  },
  {
    Library: 'react-data-table-component',
    'Weekly Downloads': 140893,
    'GitHub Stars': 2109,
    'Last Updated (days ago)': 30,
    'Size (KB)': 629,
    'Use Case': 'Material-UI based projects, responsive tables, filtering, sorting, exporting',
    Homepage: 'https://reactdatatable.com/',
    'NPM Link': 'https://www.npmjs.com/package/react-data-table-component',
    'Github Link': 'https://github.com/jbetancur/react-data-table-component',
  },
  {
    Library: 'material-table',
    'Weekly Downloads': 50738,
    'GitHub Stars': 3503,
    'Last Updated (days ago)': 213,
    'Size (KB)': 335,
    'Use Case': 'Tree views, virtualization, fixed headers/columns, RTL support',
    Homepage: 'https://www.material-table.com/',
    'NPM Link': 'https://www.npmjs.com/package/material-table',
    'Github Link': 'https://github.com/mbrn/material-table',
  },
  {
    Library: 'mantine-datatable',
    'Weekly Downloads': 27285,
    'GitHub Stars': 1013,
    'Last Updated (days ago)': 21,
    'Size (KB)': 502,
    'Use Case': 'Bootstrap-based projects, simple tables with basic features',
    Homepage: 'https://icflorescu.github.io/mantine-datatable/',
    'NPM Link': 'https://www.npmjs.com/package/mantine-datatable',
    'Github Link': 'https://github.com/icflorescu/mantine-datatable',
  },
];

export async function createReactTableLibrariesTable(userId: string) {
  const name = 'React Table Libraries';
  // Create the table with columns
  const reactTableLibrariesTable = await Table.create({
    name,
    description: 'Comparison of popular React table libraries',
    columns: reactTableColumns,
    userId,
    slug: slugify(name).toLowerCase(),
  });

  // Create rows
  const rowPromises = reactTableData.map((data) => {
    return Row.create({
      tableId: reactTableLibrariesTable._id,
      data,
      userId,
    });
  });

  await Promise.all(rowPromises);

  return reactTableLibrariesTable;
}
