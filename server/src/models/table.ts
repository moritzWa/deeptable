import { Column, ColumnState } from '@shared/types';
import mongoose, { Document } from 'mongoose';
import slugify from 'slugify';

// Column state interface extends from shared type
export interface IColumnState extends ColumnState {}

// Column definition interface extends from shared type
export interface IColumn extends Column {}

export interface ITable extends Document {
  name: string;
  description: string;
  columns: IColumn[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _id: mongoose.Types.ObjectId;
  sharingStatus: 'private' | 'public';
  slug: string;
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
  columnId: {
    type: String,
    required: true,
  },
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
  additionalTypeInformation: {
    type: mongoose.Schema.Types.Mixed,
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
      required: true,
    },
    columns: {
      type: [columnSchema],
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    sharingStatus: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a pre-save hook to ensure slug uniqueness
tableSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    let baseSlug = slugify(this.name);
    let slug = baseSlug;
    let counter = 1;

    // Keep checking until we find a unique slug
    while (await Table.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Check for duplicate column IDs within the same table
  const columnIds = this.columns.map((col) => col.columnId);
  const uniqueColumnIds = new Set(columnIds);
  if (columnIds.length !== uniqueColumnIds.size) {
    next(new Error('Duplicate column IDs are not allowed within the same table'));
    return;
  }

  next();
});

export const Table = mongoose.model<ITable>('Table', tableSchema);
