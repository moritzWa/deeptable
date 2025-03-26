import { Column } from '@shared/types';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const reactTableColumns: Column[] = [
  { name: 'Library', type: 'text' },
  { name: 'Weekly Downloads', type: 'number' },
  { name: 'GitHub Stars', type: 'number' },
  { name: 'Last Updated (days ago)', type: 'number' },
  { name: 'Size (KB)', type: 'number' },
  { name: 'Use Case', type: 'text' },
  { name: 'Homepage', type: 'link' },
  { name: 'Github Link', type: 'link' },
];

export const reactTableData = [
  {
    Library: 'React Table (TanStack Table)',
    'Weekly Downloads': 1360265,
    'GitHub Stars': 25994,
    'Last Updated (days ago)': 0,
    'Size (KB)': 940,
    'Use Case':
      'Enterprise applications, large datasets, complex data manipulation, financial dashboards',
    Homepage: 'https://tanstack.com/table/latest',
    'Github Link': 'https://github.com/TanStack/table',
  },
  {
    Library: 'ag-grid-react',
    'Weekly Downloads': 455384,
    'GitHub Stars': 13600,
    'Last Updated (days ago)': 23,
    'Size (KB)': 619,
    'Use Case':
      'Simple to complex tables, customizable UI, data grids, sorting, filtering, pagination',
    Homepage: 'https://www.ag-grid.com/react-data-grid',
    'Github Link': 'https://github.com/ag-grid/ag-grid',
  },
  {
    Library: 'react-data-table-component',
    'Weekly Downloads': 140893,
    'GitHub Stars': 2109,
    'Last Updated (days ago)': 18,
    'Size (KB)': 629,
    'Use Case': 'Material-UI based projects, responsive tables, filtering, sorting, exporting',
    Homepage: 'https://reactdatatable.com/',
    'Github Link': 'https://github.com/jbetancur/react-data-table-component',
  },
  {
    Library: 'material-table',
    'Weekly Downloads': 50738,
    'GitHub Stars': 3503,
    'Last Updated (days ago)': 21,
    'Size (KB)': 335,
    'Use Case': 'Tree views, virtualization, fixed headers/columns, RTL support',
    Homepage: 'https://www.material-react-table.com/',
    'Github Link': 'https://github.com/KevinVandy/material-react-table',
  },
  {
    Library: 'mantine-datatable',
    'Weekly Downloads': 27285,
    'GitHub Stars': 1013,
    'Last Updated (days ago)': 8,
    'Size (KB)': 502,
    'Use Case': 'Bootstrap-based projects, simple tables with basic features',
    Homepage: 'https://icflorescu.github.io/mantine-datatable/',
    'Github Link': 'https://github.com/icflorescu/mantine-datatable',
  },
];

export async function createReactTableLibrariesTable(userId: string) {
  // Create the table with columns
  const reactTableLibrariesTable = await Table.create({
    name: 'React Table Libraries Comparison',
    description:
      'Compare react libraries for tables - look at weekly downloads number of github stars and when it was last updated',
    columns: reactTableColumns,
    userId,
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
