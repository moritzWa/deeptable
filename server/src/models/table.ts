import mongoose, { Document } from 'mongoose';

// Define column types
export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

// Column definition interface
export interface IColumn {
  name: string;
  type: ColumnType;
  required?: boolean;
  defaultValue?: any;
  description?: string;
}

export interface ITable extends Document {
  name: string;
  description?: string | null;
  columns: IColumn[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _id: mongoose.Types.ObjectId;
}

// Column schema for better type support
const columnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'date', 'array', 'object'],
    default: 'string',
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
});

const tableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  columns: {
    type: [columnSchema],
    required: true,
    default: [],
  },
  userId: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

export const Table = mongoose.model<ITable>('Table', tableSchema); 