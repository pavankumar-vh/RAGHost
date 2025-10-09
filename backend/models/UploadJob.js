import mongoose from 'mongoose';

const uploadJobSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  botId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bot',
    required: true,
    index: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'extracting', 'chunking', 'embedding', 'uploading', 'completed', 'failed'],
    default: 'pending',
    index: true,
  },
  progress: {
    current: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 100,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    message: {
      type: String,
      default: 'Initializing...',
    },
  },
  result: {
    chunksProcessed: Number,
    vectorsUploaded: Number,
    error: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 3600, // Auto-delete after 1 hour
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
uploadJobSchema.index({ userId: 1, status: 1, createdAt: -1 });
uploadJobSchema.index({ botId: 1, status: 1 });

const UploadJob = mongoose.model('UploadJob', uploadJobSchema);

export default UploadJob;
