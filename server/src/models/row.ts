import { EnrichmentMetadata } from '@shared/types';
import mongoose, { Document } from 'mongoose';

export interface IRow extends Document {
  tableId: mongoose.Types.ObjectId;
  index: number;
  data: Record<string, any>; // Flexible schema to store any column data
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _id: mongoose.Types.ObjectId;
  enrichments?: EnrichmentMetadata[]; // Make it optional with ?
}

const enrichmentMetadataSchema = new mongoose.Schema({
  columnId: {
    type: String,
    required: true,
  },
  reasoningSteps: [
    {
      type: String,
      required: true,
    },
  ],
  confidenceScore: {
    type: Number,
    required: true,
  },
  sources: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const rowSchema = new mongoose.Schema(
  {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
      index: true, // Index for faster queries by tableId
    },
    index: {
      type: Number,
      required: true,
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
    },
    enrichments: {
      type: [enrichmentMetadataSchema],
      required: false, // Make it optional
    },
  },
  {
    timestamps: true,
    strict: false, // Allow for flexible schema
  }
);

// Create compound index for faster queries
rowSchema.index({ tableId: 1, userId: 1 });

export const Row = mongoose.model<IRow>('Row', rowSchema);
