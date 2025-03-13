export type TargetMode = "stargazers" | "forks" | "watchers" | "contributors";

// Column type definition
export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

// Column interface for client-side use
export interface Column {
  name: string;
  type: ColumnType;
  required?: boolean;
  defaultValue?: any;
  description?: string;
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