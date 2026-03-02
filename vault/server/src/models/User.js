const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    masterSalt: {
      type: String,
      required: true,
    },
    twoFactorSecret: {
      type: String,
      required: true,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: true,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      default: null,
    },
    trustedEmail: {
      type: String,
      default: null,
    },
    inactivityMonths: {
      type: Number,
      default: 6,
      min: 1,
      max: 24,
    },
    deadManEnabled: {
      type: Boolean,
      default: false,
    },
    deadManRecoveryToken: {
      type: String,
      default: null,
    },
    deadManRecoveryExpiresAt: {
      type: Date,
      default: null,
    },
    deadManRecoveryUsedAt: {
      type: Date,
      default: null,
    },
    recoveryLastSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
