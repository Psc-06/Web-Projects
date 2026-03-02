const express = require('express');
const AuditLog = require('../models/AuditLog');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(500);
    return res.json({ logs });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
