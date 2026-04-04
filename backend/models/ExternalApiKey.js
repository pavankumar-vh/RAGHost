import mongoose from 'mongoose';
import crypto from 'crypto';

const externalApiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Firebase UID
      required: true,
      index: true,
    },
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot',
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    // Store hashed key (never plain text)
    keyHash: {
      type: String,
      required: true,
      unique: true,
    },
    // Store prefix for identification (first 8 chars: "rh_xxxx...")
    keyPrefix: {
      type: String,
      required: true,
    },
    // Scopes: what this key can do
    scopes: {
      type: [String],
      enum: ['query', 'upload'],
      default: ['query'],
    },
    // Status
    active: {
      type: Boolean,
      default: true,
    },
    // Usage tracking
    lastUsedAt: {
      type: Date,
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    // Optional expiry
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookups (keyHash already indexed via unique: true)
externalApiKeySchema.index({ userId: 1, botId: 1 });

/**
 * Generate a new API key
 * Returns { raw, hash, prefix } — raw is shown once to the user
 */
externalApiKeySchema.statics.generateKey = function () {
  const raw = `rh_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const prefix = raw.substring(0, 7) + '...';
  return { raw, hash, prefix };
};

/**
 * Hash a raw key for lookup
 */
externalApiKeySchema.statics.hashKey = function (rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
};

const ExternalApiKey = mongoose.model('ExternalApiKey', externalApiKeySchema);

export default ExternalApiKey;
