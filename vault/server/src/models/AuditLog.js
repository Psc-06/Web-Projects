const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: false,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.pre('findOneAndUpdate', function immutableUpdate(next) {
  next(new Error('Audit logs are immutable and cannot be edited'));
});

auditLogSchema.pre('updateOne', function immutableUpdate(next) {
  next(new Error('Audit logs are immutable and cannot be edited'));
});

auditLogSchema.pre('deleteOne', function immutableDelete(next) {
  next(new Error('Audit logs are immutable and cannot be deleted'));
});

auditLogSchema.pre('deleteMany', function immutableDelete(next) {
  next(new Error('Audit logs are immutable and cannot be deleted'));
});

auditLogSchema.pre('findOneAndDelete', function immutableDelete(next) {
  next(new Error('Audit logs are immutable and cannot be deleted'));
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
