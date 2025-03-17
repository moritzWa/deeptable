// Column type definition
export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

// Column state interface for AG Grid state persistence
export interface ColumnState {
  colId?: string;
  width?: number;
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  sort?: 'asc' | 'desc' | null;
  sortIndex?: number;
  aggFunc?: string | null;
  rowGroup?: boolean;
  rowGroupIndex?: number;
  pivot?: boolean;
  pivotIndex?: number;
  flex?: number;
}

// Column interface for client-side use
export interface Column {
  name: string;
  type: ColumnType;
  required?: boolean;
  defaultValue?: any;
  description?: string;
  columnState?: ColumnState;
}

// Table interface
export interface Table {
  id: string;
  name: string;
  description?: string | null;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type LanguageKeys = 'langJS' | 'langTS' | 'langPython' | 'langGo' | 'langRust' | 'langCpp';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
  hasSubscription?: boolean;
  stripeCustomerId?: string;
} 