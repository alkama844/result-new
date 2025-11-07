const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hour = String(now.getUTCHours()).padStart(2, '0');
    const min = String(now.getUTCMinutes()).padStart(2, '0');
    const sec = String(now.getUTCSeconds()).padStart(2, '0');
    console.log(`[${year}-${month}-${day} ${hour}:${min}:${sec}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://resultweb:nafijpro@resultweb.jagonmx.mongodb.net/resultweb?retryWrites=true&w=majority';

let db;
let isDbReady = false;
let client;

async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    const options = {
      maxPoolSize: 100,
      minPoolSize: 20,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 5000,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      compressors: ['zlib'],
    };

    client = await MongoClient.connect(MONGODB_URI, options);
    db = client.db('resultweb');

    await Promise.all([
      db.collection('results').createIndex({ roll: 1 }, { unique: true, background: true }),
      db.collection('results').createIndex({ c: 1 }, { background: true }),
      db.collection('results').createIndex({ s: 1 }, { sparse: true, background: true }),
    ]);

    console.log('✅ MongoDB connected');
    isDbReady = true;
    return db;
  } catch (error) {
    console.error('❌ MongoDB error:', error.message);
    isDbReady = false;
    setTimeout(connectDB, 5000);
  }
}

connectDB();

const ADMIN_EMAILS = [
  'nafijrahaman2026@gmail.com',
  'nafijrahaman19721@gmail.com',
  'nafijrahaman2022@gmail.com',
  'alkama844@gmail.com',
];

// ============================================
// API ROUTES - DEFINED FIRST!
// ============================================

app.get('/status', (req, res) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');
  const min = String(now.getUTCMinutes()).padStart(2, '0');
  const sec = String(now.getUTCSeconds()).padStart(2, '0');
  
  res.json({
    status: 'live',
    message: 'Server is running',
    timestamp: now.toISOString(),
    database: isDbReady ? 'connected' : 'connecting',
    currentDate: `${year}-${month}-${day}`,
    currentTime: `${hour}:${min}:${sec}`,
    currentDateTime: `${year}-${month}-${day} ${hour}:${min}:${sec}`,
  });
});

app.get('/api/health', async (req, res) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');
  const min = String(now.getUTCMinutes()).padStart(2, '0');
  const sec = String(now.getUTCSeconds()).padStart(2, '0');
  
  const healthCheck = {
    status: isDbReady ? 'ready' : 'connecting',
    database: isDbReady ? 'connected' : 'disconnected',
    timestamp: now.toISOString(),
    currentDateTime: `${year}-${month}-${day} ${hour}:${min}:${sec} UTC`,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
  };

  if (isDbReady && db) {
    try {
      await db.admin().ping();
      const stats = await db.collection('results').estimatedDocumentCount();
      healthCheck.documentsCount = stats;
    } catch (error) {
      healthCheck.status = 'error';
      healthCheck.error = error.message;
    }
  }

  res.status(isDbReady ? 200 : 503).json(healthCheck);
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    
    if (ADMIN_EMAILS.includes(email)) {
      console.log(`✅ Admin login: ${email}`);
      res.json({ success: true, message: 'Login successful' });
    } else {
      console.log(`⚠️ Unauthorized: ${email}`);
      res.status(403).json({ success: false, message: 'Not authorized' });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ✅ STATISTICS - MUST BE BEFORE :rollNumber ROUTE
app.get('/api/results/statistics', async (req, res) => {
  try {
    console.log('📊 Statistics request received');
    
    if (!isDbReady || !db) {
      console.log('❌ Database not ready');
      return res.status(503).json({ error: 'Database not ready' });
    }

    console.log('📥 Fetching all results...');
    const allResults = await db.collection('results').find({}).toArray();
    console.log(`✅ Got ${allResults.length} results`);

    if (allResults.length === 0) {
      return res.json({ total: 0, passed: 0, failed: 0, avgCGPA: 'N/A', topSubjects: [] });
    }

    let passed = 0, failed = 0, cgpaSum = 0, cgpaCount = 0;
    const subjectCounts = {};

    allResults.forEach(r => {
      const hasRef = (r.s && r.s.length > 0) || ['g1','g2','g3','g4','g5','g6','g7','g8'].some(k => r[k] === 'r');
      if (hasRef) failed++; else passed++;

      if (r.c && r.c !== 'n') {
        const c = parseFloat(r.c);
        if (!isNaN(c) && c > 0) { cgpaSum += c; cgpaCount++; }
      }

      if (r.s && Array.isArray(r.s)) {
        r.s.forEach(s => { if (s) subjectCounts[s] = (subjectCounts[s] || 0) + 1; });
      }
    });

    const topSubjects = Object.entries(subjectCounts)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const stats = {
      total: allResults.length,
      passed,
      failed,
      avgCGPA: cgpaCount > 0 ? (cgpaSum / cgpaCount).toFixed(2) : 'N/A',
      topSubjects
    };

    console.log('✅ Stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Statistics error:', error);
    res.status(500).json({ error: 'Failed to calculate statistics', details: error.message });
  }
});

app.get('/api/results/all', async (req, res) => {
  try {
    if (!isDbReady || !db) return res.status(503).json({ error: 'Database not ready' });

    console.log('📥 Fetching all results...');
    const results = await db.collection('results').find({}).project({ _id: 0 }).toArray();
    console.log(`✅ Retrieved ${results.length} results`);

    res.set({ 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    res.json(results);
  } catch (error) {
    console.error('❌ Get all error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

app.get('/api/results/:rollNumber', async (req, res) => {
  try {
    if (!isDbReady || !db) return res.status(503).json({ error: 'Database not ready' });

    const { rollNumber } = req.params;
    if (!/^\d{6}$/.test(rollNumber)) return res.status(400).json({ error: 'Invalid roll number' });

    const result = await db.collection('results').findOne(
      { roll: rollNumber },
      { projection: { _id: 0 }, hint: { roll: 1 } }
    );

    if (!result) return res.status(404).json({ error: 'Result not found' });

    res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate' });
    res.json(result);
  } catch (error) {
    console.error('❌ Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

app.post('/api/results/bulk', async (req, res) => {
  try {
    if (!isDbReady || !db) return res.status(503).json({ error: 'Database not ready' });

    const { results } = req.body;
    if (!results || !Array.isArray(results)) return res.status(400).json({ error: 'Invalid data' });
    if (results.length === 0) return res.status(400).json({ error: 'No results' });

    console.log(`📤 Uploading ${results.length} results...`);

    let totalInserted = 0, totalUpdated = 0, errors = [];
    const BATCH_SIZE = 100; // Smaller batches for better performance

    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);
      
      // Process each record individually for better control
      for (const r of batch) {
        try {
          if (!r.roll || !/^\d{6}$/.test(r.roll)) {
            errors.push(`Invalid roll: ${r.roll}`);
            continue;
          }

          const mode = r._uploadMode || 'merge';
          const clean = { ...r };
          delete clean._uploadMode;

          // ✅ REPLACE MODE: Total overwrite
          if (mode === 'replace') {
            const oldData = await db.collection('results').findOne({ roll: clean.roll });
            console.log(`🔄 REPLACE mode for ${clean.roll}: Overwriting entire record`);
            console.log(`📝 OLD DATA in database:`, oldData || 'NONE (new record)');
            console.log(`📝 NEW DATA to save:`, clean);
            
            const result = await db.collection('results').replaceOne(
              { roll: clean.roll },
              clean,
              { upsert: true }
            );
            
            console.log(`📊 Replace result: matched=${result.matchedCount}, modified=${result.modifiedCount}, upserted=${result.upsertedCount}`);
            
            // Verify what's now in database
            const verifyData = await db.collection('results').findOne({ roll: clean.roll });
            console.log(`✅ VERIFIED - Now in database:`, verifyData);
            
            if (result.upsertedCount > 0) {
              totalInserted++;
            } else if (result.modifiedCount > 0 || result.matchedCount > 0) {
              totalUpdated++;
            }
          } 
          
          // ✅ MERGE MODE: Smart merge
          else {
            const existing = await db.collection('results').findOne({ roll: clean.roll });
            
            if (!existing) {
              // New record - insert
              console.log(`➕ MERGE mode for ${clean.roll}: New record`);
              console.log(`📝 New data:`, clean);
              await db.collection('results').insertOne(clean);
              totalInserted++;
            } else {
              // Merge: Keep old, update only what's provided
              console.log(`🔀 MERGE mode for ${clean.roll}: Merging with existing`);
              console.log(`📝 Old data:`, existing);
              console.log(`📝 New data:`, clean);
              
              const merged = { ...existing };
              
              // Update CGPA if provided
              if (clean.c !== undefined) {
                merged.c = clean.c;
              }

              // Update GPAs
              for (let j = 1; j <= 8; j++) {
                const k = `g${j}`;
                if (clean[k] !== undefined) {
                  merged[k] = clean[k];
                }
              }

              // Handle subjects: if provided, use it; otherwise keep existing
              if (clean.s !== undefined) {
                merged.s = clean.s;
              }

              console.log(`📝 Merged data:`, merged);
              
              const result = await db.collection('results').replaceOne(
                { roll: clean.roll },
                merged
              );
              
              console.log(`📊 Merge result: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
              
              // Verify what's now in database
              const verifyData = await db.collection('results').findOne({ roll: clean.roll });
              console.log(`✅ VERIFIED - Now in database:`, verifyData);
              
              if (result.modifiedCount > 0 || result.matchedCount > 0) {
                totalUpdated++;
              }
            }
          }
        } catch (itemError) {
          console.error(`❌ Error processing ${r.roll}:`, itemError.message);
          errors.push(`${r.roll}: ${itemError.message}`);
        }
      }
    }

    console.log(`✅ Upload complete: ${totalInserted} inserted, ${totalUpdated} updated`);
    res.json({ success: true, inserted: totalInserted, updated: totalUpdated, total: results.length, errors });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Serve static files AFTER API routes
app.use(express.static('.', { maxAge: '1d', etag: true, index: 'index.html' }));
app.get('/', (req, res) => res.sendFile('index.html', { root: '.' }));

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');
  const min = String(now.getUTCMinutes()).padStart(2, '0');
  const sec = String(now.getUTCSeconds()).padStart(2, '0');
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 SERVER LIVE ON PORT ${PORT}`);
  console.log(`📅 ${year}-${month}-${day} ${hour}:${min}:${sec} UTC`);
  console.log(`🌐 Database: ${isDbReady ? 'CONNECTED ✅' : 'Connecting...'}`);
  console.log(`${'='.repeat(50)}\n`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\nClosing...');
  if (client) await client.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nClosing...');
  if (client) await client.close();
  process.exit(0);
});
