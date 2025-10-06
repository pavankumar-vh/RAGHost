import mongoose from 'mongoose';

const botSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Firebase UID
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Support', 'Sales', 'Docs', 'General', 'Custom'],
      default: 'General',
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'training'],
      default: 'inactive',
    },
    color: {
      type: String,
      enum: ['pink', 'yellow', 'blue'],
      default: 'blue',
    },
    
    // Pinecone Configuration (encrypted) - REQUIRED for each bot
    pineconeKey: {
      type: String,
      required: true, // Each bot MUST have Pinecone
    },
    pineconeEnvironment: {
      type: String,
      required: true,
    },
    pineconeIndexName: {
      type: String,
      required: true,
    },
    pineconeVerified: {
      type: Boolean,
      default: false,
    },
    
    // Gemini Configuration (encrypted) - REQUIRED for each bot
    geminiKey: {
      type: String,
      required: true, // Each bot MUST have Gemini
    },
    geminiVerified: {
      type: Boolean,
      default: false,
    },
    
    // Stats
    totalQueries: {
      type: Number,
      default: 0,
    },
    avgResponseTime: {
      type: Number,
      default: 0, // in milliseconds
    },
    accuracy: {
      type: Number,
      default: 0, // percentage
    },
    totalTokensUsed: {
      type: Number,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0, // in USD
    },
    dailyStats: [{
      date: { type: Date, required: true },
      queries: { type: Number, default: 0 },
      tokens: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 },
    }],
    
    // Configuration
    lastVerified: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
botSchema.index({ userId: 1, status: 1 });
botSchema.index({ userId: 1, createdAt: -1 });

const Bot = mongoose.model('Bot', botSchema);

export default Bot;
