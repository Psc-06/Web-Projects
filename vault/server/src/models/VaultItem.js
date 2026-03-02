const mongoose = require('mongoose');

const vaultItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['note', 'apiKey', 'credential', 'file'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    encryptedContent: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    fileMetadata: {
      name: String,
      mimeType: String,
      size: Number,
    },
    shareToken: {
      type: String,
      default: null,
      index: true,
    },
    shareExpiresAt: {
      type: Date,
      default: null,
    },
    shareUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('VaultItem', vaultItemSchema);
