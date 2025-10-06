import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Firebase UID
      required: true,
    },
    // Global Gemini API Key (encrypted)
    // This will be used by default for all bots unless they specify their own
    geminiKey: {
      type: String,
      required: false,
    },
    // Status flags
    geminiVerified: {
      type: Boolean,
      default: false,
    },
    lastVerified: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one document per user
apiKeySchema.index({ userId: 1 }, { unique: true });

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
