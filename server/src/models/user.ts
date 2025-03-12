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
  formPreferences: {
    apiKey: String,
    repositoryUrl: String,
    target_mode: {
      type: String,
      enum: ["stargazers", "forks", "watchers", "contributors"],
    },
    repos: Number,
    langJS: Boolean,
    langTS: Boolean,
    langPython: Boolean,
    langGo: Boolean,
    langRust: Boolean,
    langCpp: Boolean,
    langPerc: Number,
    followers: Number,
    following: Number,
    account_created: Number,
    repo_updated: Number,
  },
  hasSubscription: { type: Boolean, default: false },
  stripeCustomerId: { type: String },
  exportActionUsageCount: { type: Number, default: 0 },
});

export const User = mongoose.model('User', userSchema); 