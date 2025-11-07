const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://resultweb:nafijpro@resultweb.jagonmx.mongodb.net/resultweb?retryWrites=true&w=majority';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  });

  const db = client.db('resultweb');

  await db.collection('results').createIndex({ roll: 1 }, { unique: true });

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { results } = req.body;

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'No results to upload' });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('results');

    const bulkOps = results.map(result => ({
      updateOne: {
        filter: { roll: result.roll },
        update: { $set: result },
        upsert: true
      }
    }));

    const bulkResult = await collection.bulkWrite(bulkOps, { ordered: false });

    res.status(200).json({
      success: true,
      inserted: bulkResult.upsertedCount,
      updated: bulkResult.modifiedCount,
      total: results.length
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      details: error.message
    });
  }
};
