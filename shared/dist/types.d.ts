export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
export interface Column {
    name: string;
    type: ColumnType;
    required?: boolean;
    defaultValue?: any;
    description?: string;
}
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
