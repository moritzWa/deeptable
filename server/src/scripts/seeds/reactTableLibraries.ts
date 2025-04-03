import { Column } from '@shared/types';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const reactTableColumns: Column[] = [
  {
    columnId: randomUUID(),
    name: 'Library',
    type: 'text',
    description: 'Name of the React table library',
  },
  {
    columnId: randomUUID(),
    name: 'Weekly Downloads',
    type: 'number',
    description: 'Number of weekly downloads from NPM',
  },
  {
    columnId: randomUUID(),
    name: 'GitHub Stars',
    type: 'number',
    description: 'Number of stars on GitHub repository',
  },
  {
    columnId: randomUUID(),
    name: 'Last Updated (days ago)',
    type: 'number',
    description: 'Days since the last update to the library on NPM',
  },
  {
    columnId: randomUUID(),
    name: 'Size (KB)',
    type: 'number',
    description: 'Size of the library in kilobytes, unpacked',
  },
  {
    columnId: randomUUID(),
    name: 'Use Case',
    type: 'text',
    description: 'Primary use cases for the library',
  },
  {
    columnId: randomUUID(),
    name: 'Homepage',
    type: 'link',
    description: 'Link to the library website/documentation, otherwise NPM or Github',
  },
  {
    columnId: randomUUID(),
    name: 'NPM Link',
    type: 'link',
    description: 'Link to the NPM package page',
  },
  {
    columnId: randomUUID(),
    name: 'Github Link',
    type: 'link',
    description: 'Link to the GitHub repository',
  },
];

// Create a mapping of column names to column IDs for data transformation
const columnNameToId = Object.fromEntries(reactTableColumns.map((col) => [col.name, col.columnId]));

// Transform the React table data to use column IDs instead of names
export const reactTableData = [
  {
    [columnNameToId['Library']]: 'React Table (TanStack Table)',
    [columnNameToId['Weekly Downloads']]: 3277189,
    [columnNameToId['GitHub Stars']]: 26100,
    [columnNameToId['Last Updated (days ago)']]: 61,
    [columnNameToId['Size (KB)']]: 761,
    [columnNameToId['Use Case']]:
      'Enterprise applications, large datasets, complex data manipulation, financial dashboards',
    [columnNameToId['Homepage']]: 'https://tanstack.com/table/latest',
    [columnNameToId['NPM Link']]: 'https://www.npmjs.com/package/@tanstack/react-table',
    [columnNameToId['Github Link']]: 'https://github.com/TanStack/table',
  },
  {
    [columnNameToId['Library']]: 'ag-grid-react',
    [columnNameToId['Weekly Downloads']]: 57940,
    [columnNameToId['GitHub Stars']]: 13600,
    [columnNameToId['Last Updated (days ago)']]: 3,
    [columnNameToId['Size (KB)']]: 619,
    [columnNameToId['Use Case']]:
      'Simple to complex tables, customizable UI, data grids, sorting, filtering, pagination',
    [columnNameToId['Homepage']]: 'https://www.ag-grid.com/react-data-grid',
    [columnNameToId['NPM Link']]: 'https://www.npmjs.com/package/ag-grid-react',
    [columnNameToId['Github Link']]: 'https://github.com/ag-grid/ag-grid',
  },
  {
    [columnNameToId['Library']]: 'react-data-table-component',
    [columnNameToId['Weekly Downloads']]: 140893,
    [columnNameToId['GitHub Stars']]: 2109,
    [columnNameToId['Last Updated (days ago)']]: 30,
    [columnNameToId['Size (KB)']]: 629,
    [columnNameToId['Use Case']]:
      'Material-UI based projects, responsive tables, filtering, sorting, exporting',
    [columnNameToId['Homepage']]: 'https://reactdatatable.com/',
    [columnNameToId['NPM Link']]: 'https://www.npmjs.com/package/react-data-table-component',
    [columnNameToId['Github Link']]: 'https://github.com/jbetancur/react-data-table-component',
  },
  {
    [columnNameToId['Library']]: 'material-table',
    [columnNameToId['Weekly Downloads']]: 50738,
    [columnNameToId['GitHub Stars']]: 3503,
    [columnNameToId['Last Updated (days ago)']]: 213,
    [columnNameToId['Size (KB)']]: 335,
    [columnNameToId['Use Case']]: 'Tree views, virtualization, fixed headers/columns, RTL support',
    [columnNameToId['Homepage']]: 'https://www.material-table.com/',
    [columnNameToId['NPM Link']]: 'https://www.npmjs.com/package/material-table',
    [columnNameToId['Github Link']]: 'https://github.com/mbrn/material-table',
  },
  {
    [columnNameToId['Library']]: 'mantine-datatable',
    [columnNameToId['Weekly Downloads']]: 27285,
    [columnNameToId['GitHub Stars']]: 1013,
    [columnNameToId['Last Updated (days ago)']]: 21,
    [columnNameToId['Size (KB)']]: 502,
    [columnNameToId['Use Case']]: 'Bootstrap-based projects, simple tables with basic features',
    [columnNameToId['Homepage']]: 'https://icflorescu.github.io/mantine-datatable/',
    [columnNameToId['NPM Link']]: 'https://www.npmjs.com/package/mantine-datatable',
    [columnNameToId['Github Link']]: 'https://github.com/icflorescu/mantine-datatable',
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

  // Create rows with the data (already using column IDs)
  const rowPromises = reactTableData.map((data, index) => {
    return Row.create({
      tableId: reactTableLibrariesTable._id,
      data,
      userId,
      index,
    });
  });

  await Promise.all(rowPromises);

  return reactTableLibrariesTable;
}
