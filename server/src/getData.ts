async function getRowsAndTable({
  tableId,
  slug,
  userId,
  offset,
  limit,
}: {
  tableId?: string;
  slug?: string;
  userId?: string;
  offset?: number;
  limit?: number;
}): Promise<{
  table: Table;
  rows: Row[];
}> {

  const query: any = {
    $or: [
      { userId }, // Match if user owns the table
      { sharingStatus: 'public' }, // Match if table is public
    ].filter(Boolean), // Remove userId condition if not provided
  };

  if (tableId) {
    query._id = tableId;
  } else if (slug) {
    query.slug = slug;
  } else {
    throw new Error('Either tableId or slug must be provided');
  }

  // Verify table exists and check if it's public or belongs to user
  const table = await TableModel.findOne({
    _id: tableId,
    $or: [
      { userId }, // Match if user owns the table
      { sharingStatus: 'public' }, // Match if table is public
    ].filter(Boolean), // Remove userId condition if not provided
  });

  if (!table) {
    throw new Error('Table not found');
  }

  // Get rows with pagination
  const rows = await RowModel.find({
    tableId: tableId,
  })
    .sort({ index: 1 })
    .skip(offset || 0)
    .limit(limit || 50);

  return {
    table: {
      id: table._id.toString(),
      name: table.name,
      description: table.description,
      columns: table.columns.map((col) => ({
        columnId: col.columnId,
        name: col.name,
        type: col.type,
        additionalTypeInformation: col.additionalTypeInformation,
        required: col.required || false,
        defaultValue: col.defaultValue,
        description: col.description,
        columnState: col.columnState,
      })),
      createdAt: table.createdAt.toISOString(),
      updatedAt: table.updatedAt.toISOString(),
      userId: table.userId,
      sharingStatus: table.sharingStatus,
      isOwner: userId === table.userId,
      slug: table.slug,
      beforeTableText: table.beforeTableText,
      afterTableText: table.afterTableText,
    },
    rows: rows.map((row: IRow) => ({
      id: row._id.toString(),
      tableId: row.tableId.toString(),
      data: row.data,
      index: row.index,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      userId: row.userId,
    })),
  }
}