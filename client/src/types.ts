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

export interface FormPreferences {
  apiKey?: string;
  repositoryUrl?: string;
  target_mode?: TargetMode;
  repos?: number;
  langJS?: boolean;
  langTS?: boolean;
  langPython?: boolean;
  langGo?: boolean;
  langRust?: boolean;
  langCpp?: boolean;
  langPerc?: number;
  followers?: number;
  following?: number;
  account_created?: number;
  repo_updated?: number;
}

export type LanguageKeys = 'langJS' | 'langTS' | 'langPython' | 'langGo' | 'langRust' | 'langCpp';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
  formPreferences?: FormPreferences;
  hasSubscription?: boolean;
  stripeCustomerId?: string;
} 