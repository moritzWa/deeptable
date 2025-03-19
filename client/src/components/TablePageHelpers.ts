import { ColumnState } from '@shared/types';
import { ColDef } from 'ag-grid-community';

/**
 * Converts our application's column state format to AG Grid's column definition properties.
 * This handles all the necessary type conversions and null checks for AG Grid compatibility.
 */
export const convertColumnStateToAgGridProps = (columnState: ColumnState | undefined): Partial<ColDef> => {
  if (!columnState) return {};

  const props: Partial<ColDef> = {};
  
  // Map of column state properties to their conditions
  const propertyMappings = {
    width: columnState.width,
    hide: columnState.hide,
    pinned: columnState.pinned !== null ? columnState.pinned : undefined,
    sort: columnState.sort !== null ? columnState.sort : undefined,
    sortIndex: columnState.sortIndex,
    flex: columnState.flex
  };

  // Only add properties that have valid values
  Object.entries(propertyMappings).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      props[key as keyof ColDef] = value;
    }
  });

  return props;
}; 