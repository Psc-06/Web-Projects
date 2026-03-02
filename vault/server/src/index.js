require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDb = require('./config/db');
const authRoutes = require('./routes/auth');
const vaultRoutes = require('./routes/vault');
const auditRoutes = require('./routes/audit');
const securityRoutes = require('./routes/security');
const { errorHandler } = require('./middleware/error');
const { startDeadManSwitchScheduler } = require('./services/deadManSwitchService');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/security', securityRoutes);

app.use(errorHandler);

const port = process.env.PORT || 4000;

const bootstrap = async () => {
  await connectDb();
  app.listen(port, () => {
    console.log(`Vault API listening on ${port}`);
  });

  startDeadManSwitchScheduler(process.env.BASE_URL || `http://localhost:${port}`);
};

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
