import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  picture: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  hasSubscription: { type: Boolean, default: false },
  stripeCustomerId: { type: String },
  exportActionUsageCount: { type: Number, default: 0 },
});

export const User = mongoose.model('User', userSchema); 