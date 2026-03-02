const mongoose = require('mongoose');

const deadManSwitchEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    trustedEmail: {
      type: String,
      required: true,
    },
    recoveryToken: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'consumed'],
      default: 'sent',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DeadManSwitchEvent', deadManSwitchEventSchema);
