const AuditLog = require('../models/AuditLog');

const getRequestIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
};

const createAuditLog = async ({ req, userId = null, action, metadata = {} }) => {
  await AuditLog.create({
    userId,
    action,
    metadata,
    ipAddress: getRequestIp(req),
  });
};

module.exports = { createAuditLog, getRequestIp };
