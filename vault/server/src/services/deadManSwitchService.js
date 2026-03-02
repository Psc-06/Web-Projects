const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const DeadManSwitchEvent = require('../models/DeadManSwitchEvent');
const { sendRecoveryEmail } = require('../utils/mockMailer');

const createRecoveryToken = () => `${uuidv4()}-${uuidv4()}`;

const shouldTriggerRecovery = (user) => {
  if (!user.deadManEnabled || !user.trustedEmail) {
    return false;
  }

  const now = Date.now();
  const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt).getTime() : new Date(user.createdAt).getTime();
  const inactivityMs = user.inactivityMonths * 30 * 24 * 60 * 60 * 1000;

  return now - lastLogin >= inactivityMs;
};

const triggerRecoveryForUser = async (user, baseUrl) => {
  const recoveryToken = createRecoveryToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  user.deadManRecoveryToken = recoveryToken;
  user.deadManRecoveryExpiresAt = expiresAt;
  user.deadManRecoveryUsedAt = null;
  user.recoveryLastSentAt = new Date();
  await user.save();

  const recoveryLink = `${baseUrl}/api/security/recovery/${recoveryToken}`;
  await sendRecoveryEmail({ to: user.trustedEmail, recoveryLink });

  await DeadManSwitchEvent.create({
    userId: user._id,
    trustedEmail: user.trustedEmail,
    recoveryToken,
    status: 'sent',
  });
};

const scanAndTriggerDeadManSwitch = async (baseUrl) => {
  const users = await User.find({ deadManEnabled: true, trustedEmail: { $ne: null } });

  for (const user of users) {
    if (!shouldTriggerRecovery(user)) {
      continue;
    }

    const sentRecently = user.recoveryLastSentAt
      && Date.now() - new Date(user.recoveryLastSentAt).getTime() < 7 * 24 * 60 * 60 * 1000;

    if (sentRecently) {
      continue;
    }

    await triggerRecoveryForUser(user, baseUrl);
  }
};

const startDeadManSwitchScheduler = (baseUrl) => {
  const intervalMs = 60 * 60 * 1000;
  setInterval(() => {
    scanAndTriggerDeadManSwitch(baseUrl).catch((error) => {
      console.error('Dead man switch scan failed', error);
    });
  }, intervalMs);
};

module.exports = {
  scanAndTriggerDeadManSwitch,
  triggerRecoveryForUser,
  startDeadManSwitchScheduler,
};
