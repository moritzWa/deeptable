import { ColumnType } from '@shared/types';
import mongoose, { Document } from 'mongoose';

// Define column types

// Column state interface
export interface IColumnState {
  colId?: string;
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
}

// Column definition interface
export interface IColumn {
  name: string;
  type: ColumnType;
  required?: boolean;
  defaultValue?: any;
  description?: string;
  columnState?: IColumnState;
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

// Column state schema
const columnStateSchema = new mongoose.Schema(
  {
    colId: { type: String, required: false },
    width: { type: Number, required: false },
    hide: { type: Boolean, required: false },
    pinned: { type: String, required: false },
    sort: { type: String, required: false },
    sortIndex: { type: Number, required: false },
    aggFunc: { type: String, required: false },
    rowGroup: { type: Boolean, required: false },
    rowGroupIndex: { type: Number, required: false },
    pivot: { type: Boolean, required: false },
    pivotIndex: { type: Number, required: false },
    flex: { type: Number, required: false },
    orderIndex: { type: Number, required: false },
  },
  { _id: false, strict: false }
);

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
  columnState: {
    type: columnStateSchema,
    required: false,
  },
});

const tableSchema = new mongoose.Schema(
  {
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
    },
  },
  {
    timestamps: true,
  }
);

export const Table = mongoose.model<ITable>('Table', tableSchema);
