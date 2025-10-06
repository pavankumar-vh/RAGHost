import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Firebase UID
      required: true,
    },
    // Pinecone credentials (encrypted)
    pineconeKey: {
      type: String,
      required: false,
    },
    pineconeEnvironment: {
      type: String,
      required: false,
    },
    pineconeIndexName: {
      type: String,
      required: false,
    },
    // Gemini credentials (encrypted)
    geminiKey: {
      type: String,
      required: false,
    },
    // Status flags
    pineconeVerified: {
      type: Boolean,
      default: false,
    },
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
