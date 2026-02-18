import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      avatarColor:        { type: String, default: '#FFE500' },
      avatarEmoji:        { type: String, default: '' },
      avatarMode:         { type: String, enum: ['initials', 'emoji', 'url'], default: 'initials' },
      emailNotifications: { type: Boolean, default: false },
      queryAlerts:        { type: Boolean, default: false },
      weeklyDigest:       { type: Boolean, default: false },
      compactSidebar:     { type: Boolean, default: false },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

export default User;
