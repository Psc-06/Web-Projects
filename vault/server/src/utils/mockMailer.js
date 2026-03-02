const sendRecoveryEmail = async ({ to, recoveryLink }) => {
  console.log('---------------- MOCK EMAIL ----------------');
  console.log(`To: ${to}`);
  console.log('Subject: Vault Dead Man Switch Recovery Notice');
  console.log('Body:');
  console.log(`A recovery link has been generated: ${recoveryLink}`);
  console.log('--------------------------------------------');
  return true;
};

module.exports = { sendRecoveryEmail };
