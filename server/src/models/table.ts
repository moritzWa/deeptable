import mongoose, { Document } from 'mongoose';
import { ColumnType, ColumnState, Column } from '@shared/types';

// Column state interface extends from shared type
export interface IColumnState extends ColumnState {}

// Column definition interface extends from shared type
export interface IColumn extends Column {}

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
    enum: ['text', 'number', 'link'],
    default: 'text',
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
    required: true,
    default: '',
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
