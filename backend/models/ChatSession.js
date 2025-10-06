import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    contextUsed: Number,
    responseTime: Number,
  },
});

const chatSessionSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [messageSchema],
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
chatSessionSchema.index({ botId: 1, sessionId: 1 }, { unique: true });

// Auto-delete sessions older than 30 days
chatSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 2592000 });

// Update lastActivity before saving
chatSessionSchema.pre('save', function (next) {
  this.lastActivity = new Date();
  next();
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
