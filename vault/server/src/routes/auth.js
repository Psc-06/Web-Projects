const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { createAuditLog, getRequestIp } = require('../services/auditService');

const router = express.Router();

const createToken = (user) => jwt.sign(
  { userId: user._id.toString(), email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '12h' }
);

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, masterSalt } = req.body;
    if (!email || !password || !masterSalt) {
      return res.status(400).json({ message: 'email, password and masterSalt are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const secret = speakeasy.generateSecret({
      name: `Vault (${email})`,
      issuer: 'Vault',
    });

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      masterSalt,
      twoFactorSecret: secret.base32,
      twoFactorEnabled: true,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    await createAuditLog({
      req,
      userId: user._id,
      action: 'user_registered',
      metadata: { email: user.email },
    });

    return res.status(201).json({
      message: 'Registration successful. Configure your authenticator app.',
      qrCodeDataUrl,
      otpAuthUrl: secret.otpauth_url,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, totpToken } = req.body;
    if (!email || !password || !totpToken) {
      return res.status(400).json({ message: 'email, password and totpToken are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await createAuditLog({
        req,
        action: 'login_failed',
        metadata: { email: email.toLowerCase(), reason: 'user_not_found' },
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      await user.save();

      await createAuditLog({
        req,
        userId: user._id,
        action: 'login_failed',
        metadata: { reason: 'invalid_password' },
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isTotpValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: String(totpToken),
      window: 1,
    });

    if (!isTotpValid) {
      user.failedLoginAttempts += 1;
      await user.save();

      await createAuditLog({
        req,
        userId: user._id,
        action: 'login_failed',
        metadata: { reason: 'invalid_totp' },
      });
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    user.lastLoginIp = getRequestIp(req);
    await user.save();

    const token = createToken(user);

    await createAuditLog({
      req,
      userId: user._id,
      action: 'vault_opened',
      metadata: { loginIp: user.lastLoginIp },
    });

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select(
      'email masterSalt failedLoginAttempts lastLoginAt lastLoginIp trustedEmail inactivityMonths deadManEnabled'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

router.post('/2fa/regenerate', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const secret = speakeasy.generateSecret({
      name: `Vault (${user.email})`,
      issuer: 'Vault',
    });

    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = true;
    await user.save();

    await createAuditLog({
      req,
      userId: user._id,
      action: 'two_factor_regenerated',
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);
    return res.json({ qrCodeDataUrl, otpAuthUrl: secret.otpauth_url });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
