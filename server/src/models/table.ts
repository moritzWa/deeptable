import mongoose, { Document } from 'mongoose';

export interface ITable extends Document {
  name: string;
  description?: string | null;
  columns: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _id: mongoose.Types.ObjectId;
}

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
    type: [String],
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