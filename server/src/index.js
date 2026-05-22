const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const prisma = require('./config/database');
const { connectRedis } = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json());

// ── Subscription check (runs before shop routes, skips /auth and /superadmin) ─
app.use('/api', require('./middleware/subscription'));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/shops',        require('./routes/shops'));
app.use('/api/products',     require('./routes/products'));
app.use('/api/sales',        require('./routes/sales'));
app.use('/api/customers',    require('./routes/customers'));
app.use('/api/purchases',    require('./routes/purchases'));
app.use('/api/reports',      require('./routes/reports'));
app.use('/api/superadmin',   require('./routes/superadmin'));

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';
  try { await prisma.$queryRaw`SELECT 1`; dbStatus = 'connected'; } catch {}
  try {
    const { redisClient } = require('./config/redis');
    if (redisClient.isOpen) redisStatus = 'connected';
  } catch {}
  res.json({ status: 'ok', message: 'HardwareHub API', db: dbStatus, redis: redisStatus });
});

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ── Startup ────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }

  try {
    await connectRedis();
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

module.exports = app;
