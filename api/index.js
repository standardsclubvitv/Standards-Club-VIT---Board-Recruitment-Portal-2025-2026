/**
 * Vercel Serverless Function Entry Point
 * Handles all API routes for Standards Club Recruitment
 */

const getPositionsHandler = require('./get-positions.js');
const submitApplicationHandler = require('./submit-application.js');
const adminLoginHandler = require('./admin/login.js');
const adminGetApplicationsHandler = require('./admin/get-applications.js');

// Helper function to wrap response for consistent API
function wrapResponse(res) {
  if (!res.status) {
    res.status = function(code) {
      res.statusCode = code;
      return this;
    };
  }
  if (!res.json) {
    res.json = function(data) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return this;
    };
  }
  return res;
}

// Helper function to parse JSON body from POST requests
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // Wrap response for Express-style methods
  wrapResponse(res);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Parse POST body if needed
    if (req.method === 'POST' && !req.body) {
      await parseBody(req);
    }

    // Get the path from query parameter (Vercel rewrites use this)
    const path = req.url || req.query.path || '';

    // Route to appropriate handler
    if (path.includes('/admin/login') || path.endsWith('admin-login')) {
      return await adminLoginHandler(req, res);
    }
    
    if (path.includes('/admin/get-applications') || path.endsWith('admin-get-applications')) {
      return await adminGetApplicationsHandler(req, res);
    }
    
    if (path.includes('/get-positions') || path.endsWith('get-positions')) {
      return await getPositionsHandler(req, res);
    }
    
    if (path.includes('/submit-application') || path.endsWith('submit-application')) {
      return await submitApplicationHandler(req, res);
    }

    // Default: API info
    return res.status(200).json({
      success: true,
      message: 'Standards Club Recruitment API',
      version: '1.0.0',
      endpoints: [
        'GET /api/get-positions',
        'POST /api/submit-application',
        'POST /api/admin/login',
        'GET /api/admin/get-applications'
      ]
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
