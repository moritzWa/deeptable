// Column type definition
export type ColumnType = 'text' | 'number' | 'link' | 'multiSelect' | 'select';

// Column state interface for AG Grid state persistence
export interface ColumnState {
  colId: string;
  width?: number;
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  sort?: 'asc' | 'desc' | null;
  sortIndex?: number | null;
  aggFunc?: string | null;
  rowGroup?: boolean;
  rowGroupIndex?: number;
  pivot?: boolean;
  pivotIndex?: number;
  flex?: number | null;
  orderIndex?: number;
  wrapText?: boolean;
  autoHeight?: boolean;
  wrapHeaderText?: boolean;
  autoHeaderHeight?: boolean;
}

export interface SelectItem {
  id: string;
  name: string;
  color: string;
}
// Column interface for client-side use
export interface Column {
  columnId: string;
  name: string;
  type: ColumnType;
  additionalTypeInformation?: {
    currency?: boolean;
    decimals?: number;
    selectItems?: SelectItem[];
  };
  required?: boolean;
  defaultValue?: any;
  description: string;
  columnState?: ColumnState;
}

// Add this new type
export type SharingStatus = 'private' | 'public';

// Table interface
export interface Table {
  id: string;
  name: string;
  description: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  sharingStatus: SharingStatus;
  isOwner: boolean;
  slug: string;
  beforeTableText?: string;
  afterTableText?: string;
}

export type LanguageKeys = 'langJS' | 'langTS' | 'langPython' | 'langGo' | 'langRust' | 'langCpp';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
  hasSubscription?: boolean;
  stripeCustomerId?: string;
  isWaitlisted?: boolean;
  tokenVersion?: number;
}
