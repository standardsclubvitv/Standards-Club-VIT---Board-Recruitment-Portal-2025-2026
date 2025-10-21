/* ==========================================
   GET ALL APPLICATIONS API (ADMIN)
   ========================================== */

const { MongoClient } = require('mongodb');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Simple auth check (verify token exists)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('standards_recruitment');
    const collection = db.collection('applications');

    // Get all applications, sorted by submission date (newest first)
    const applications = await collection
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();

    await client.close();

    return res.status(200).json({
      success: true,
      applications: applications,
      count: applications.length
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
}
