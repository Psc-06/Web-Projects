const express = require('express');
const { v4: uuidv4 } = require('uuid');
const VaultItem = require('../models/VaultItem');
const { requireAuth } = require('../middleware/auth');
const { createAuditLog } = require('../services/auditService');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const items = await VaultItem.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const {
      type,
      title,
      encryptedContent,
      iv,
      salt,
      fileMetadata,
    } = req.body;

    if (!type || !title || !encryptedContent || !iv || !salt) {
      return res.status(400).json({ message: 'type, title, encryptedContent, iv, and salt are required' });
    }

    const item = await VaultItem.create({
      userId: req.user.userId,
      type,
      title,
      encryptedContent,
      iv,
      salt,
      fileMetadata,
    });

    await createAuditLog({
      req,
      userId: req.user.userId,
      action: 'item_added',
      metadata: { itemId: item._id.toString(), type: item.type },
    });

    return res.status(201).json({ item });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await VaultItem.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await createAuditLog({
      req,
      userId: req.user.userId,
      action: 'item_viewed',
      metadata: { itemId: item._id.toString() },
    });

    return res.json({ item });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await VaultItem.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await createAuditLog({
      req,
      userId: req.user.userId,
      action: 'item_deleted',
      metadata: { itemId: item._id.toString() },
    });

    return res.json({ message: 'Item deleted' });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/share', requireAuth, async (req, res, next) => {
  try {
    const { expiresInMinutes = 30 } = req.body;
    const item = await VaultItem.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.shareToken = `${uuidv4()}-${uuidv4()}`;
    item.shareExpiresAt = new Date(Date.now() + Number(expiresInMinutes) * 60 * 1000);
    item.shareUsedAt = null;
    await item.save();

    await createAuditLog({
      req,
      userId: req.user.userId,
      action: 'item_share_created',
      metadata: { itemId: item._id.toString(), expiresInMinutes: Number(expiresInMinutes) },
    });

    return res.json({
      shareLink: `${process.env.BASE_URL || 'http://localhost:4000'}/api/vault/share/${item.shareToken}`,
      expiresAt: item.shareExpiresAt,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/share/:token', async (req, res, next) => {
  try {
    const item = await VaultItem.findOne({ shareToken: req.params.token });
    if (!item) {
      return res.status(404).json({ message: 'Invalid share link' });
    }

    if (!item.shareExpiresAt || item.shareExpiresAt.getTime() < Date.now()) {
      return res.status(410).json({ message: 'Share link expired' });
    }

    if (item.shareUsedAt) {
      return res.status(410).json({ message: 'Share link already used' });
    }

    item.shareUsedAt = new Date();
    await item.save();

    return res.json({
      item: {
        title: item.title,
        type: item.type,
        encryptedContent: item.encryptedContent,
        iv: item.iv,
        salt: item.salt,
        fileMetadata: item.fileMetadata,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
