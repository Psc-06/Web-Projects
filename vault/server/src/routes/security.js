const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const VaultItem = require('../models/VaultItem');
const DeadManSwitchEvent = require('../models/DeadManSwitchEvent');
const { requireAuth } = require('../middleware/auth');
const { createAuditLog } = require('../services/auditService');
const { triggerRecoveryForUser } = require('../services/deadManSwitchService');

const router = express.Router();

router.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('lastLoginAt lastLoginIp failedLoginAttempts');
    const recentLogs = await AuditLog.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(20);
    const failedLogins = await AuditLog.countDocuments({ userId: req.user.userId, action: 'login_failed' });

    const accessLocations = [...new Set(recentLogs.map((log) => log.ipAddress))].slice(0, 10);

    return res.json({
      lastLogin: user?.lastLoginAt || null,
      lastLoginIp: user?.lastLoginIp || null,
      failedLoginAttempts: user?.failedLoginAttempts || 0,
      totalFailedLogins: failedLogins,
      accessLocations,
      auditHistory: recentLogs,
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/dead-man-switch', requireAuth, async (req, res, next) => {
  try {
    const { trustedEmail, inactivityMonths = 6, deadManEnabled = true } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.trustedEmail = trustedEmail || null;
    user.inactivityMonths = Number(inactivityMonths) || 6;
    user.deadManEnabled = Boolean(deadManEnabled && trustedEmail);
    await user.save();

    await createAuditLog({
      req,
      userId: user._id,
      action: 'dead_man_switch_updated',
      metadata: {
        trustedEmail: user.trustedEmail,
        inactivityMonths: user.inactivityMonths,
        deadManEnabled: user.deadManEnabled,
      },
    });

    return res.json({
      trustedEmail: user.trustedEmail,
      inactivityMonths: user.inactivityMonths,
      deadManEnabled: user.deadManEnabled,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/dead-man-switch/trigger', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.trustedEmail) {
      return res.status(400).json({ message: 'Configure trusted email first' });
    }

    await triggerRecoveryForUser(user, process.env.BASE_URL || 'http://localhost:4000');

    await createAuditLog({
      req,
      userId: user._id,
      action: 'dead_man_switch_triggered_manual',
    });

    return res.json({ message: 'Recovery link dispatched via mock email' });
  } catch (error) {
    return next(error);
  }
});

router.get('/dead-man-switch/events', requireAuth, async (req, res, next) => {
  try {
    const events = await DeadManSwitchEvent.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(20);
    return res.json({ events });
  } catch (error) {
    return next(error);
  }
});

router.get('/recovery/:token', async (req, res, next) => {
  try {
    const user = await User.findOne({ deadManRecoveryToken: req.params.token });
    if (!user) {
      return res.status(404).json({ message: 'Invalid recovery token' });
    }

    if (
      user.deadManRecoveryUsedAt
      || !user.deadManRecoveryExpiresAt
      || user.deadManRecoveryExpiresAt.getTime() < Date.now()
    ) {
      return res.status(410).json({ message: 'Recovery token is expired or already used' });
    }

    const items = await VaultItem.find({ userId: user._id }).select('title type encryptedContent iv salt fileMetadata createdAt');
    user.deadManRecoveryUsedAt = new Date();
    await user.save();

    await DeadManSwitchEvent.findOneAndUpdate(
      { recoveryToken: req.params.token },
      { status: 'consumed' },
      { new: true }
    );

    return res.json({
      message: 'Limited recovery access granted. Data remains encrypted.',
      userEmail: user.email,
      items,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
