require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://next-hire-ai-kappa.vercel.app'
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (optional static access)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/jobs', require('./routes/jobs'));

// ── Root Route ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('NextHire Backend is Running 🚀');
});


// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NextHire API is running 🚀', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const pool = require('./db/pool');

app.listen(PORT, () => {
  console.log(`🚀 NextHire API running on port ${PORT}`);
});

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`✅ PostgreSQL connected — server time: ${res.rows[0].now}`);

    await pool.query(`
      ALTER TABLE resumes
      ADD COLUMN IF NOT EXISTS parsed_json JSONB DEFAULT '{}'
    `);

    console.log('✅ DB migration complete');

  } catch (dbErr) {
    console.error('❌ DATABASE CONNECTION FAILED:', dbErr.message);
  }
})();

module.exports = app;

