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
    pineconeHost: {
      type: String,
      required: false, // Optional - if not provided, will construct from environment and index
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
    
    // Advanced Settings
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2,
    },
    maxTokens: {
      type: Number,
      default: 1024,
    },
    systemPrompt: {
      type: String,
      default: '',
    },
    welcomeMessage: {
      type: String,
      default: 'Hi! How can I help you today? 👋',
    },

    // Widget Customizer Config
    widgetConfig: {
      primaryColor:    { type: String, default: '#667eea' },
      secondaryColor:  { type: String, default: '#764ba2' },
      backgroundColor: { type: String, default: '#ffffff' },
      textColor:       { type: String, default: '#000000' },
      width:           { type: Number, default: 400 },
      height:          { type: Number, default: 600 },
      position:        { type: String, default: 'bottom-right' },
      borderRadius:    { type: Number, default: 16 },
      buttonSize:      { type: Number, default: 60 },
      buttonStyle:     { type: String, default: 'circle' },
      fontFamily:      { type: String, default: 'Inter, sans-serif' },
      animationSpeed:  { type: String, default: 'normal' },
    },
    
    // Embed Config Version History
    embedHistory: [{
      savedAt:  { type: Date, default: Date.now },
      color:    { type: String },
      name:     { type: String },
      type:     { type: String },
      note:     { type: String, default: '' },
    }],

    // Team Collaboration
    teamMembers: [{
      email: { type: String, required: true },
      role: { 
        type: String, 
        enum: ['owner', 'editor', 'viewer'],
        default: 'viewer'
      },
      addedAt: { type: Date, default: Date.now },
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

// Indexes for efficient queries and high performance
botSchema.index({ userId: 1, status: 1 }); // User's active bots
botSchema.index({ userId: 1, createdAt: -1 }); // User's bots by date
botSchema.index({ status: 1 }); // Active/inactive bots
botSchema.index({ 'dailyStats.date': -1 }); // Analytics queries
botSchema.index({ totalQueries: -1 }); // Popular bots
botSchema.index({ userId: 1, name: 1 }); // Search by name

const Bot = mongoose.model('Bot', botSchema);

export default Bot;
