import mongoose, { Document } from 'mongoose';

export interface IRow extends Document {
  tableId: mongoose.Types.ObjectId;
  data: Record<string, any>; // Flexible schema to store any column data
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _id: mongoose.Types.ObjectId;
}

const rowSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
    index: true, // Index for faster queries by tableId
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {},
  },
  userId: {
    type: String,
    required: true,
    index: true, // Index for faster queries by userId
  }
}, {
  timestamps: true,
  strict: false, // Allow for flexible schema
});

// Create compound index for faster queries
rowSchema.index({ tableId: 1, userId: 1 });

export const Row = mongoose.model<IRow>('Row', rowSchema); 