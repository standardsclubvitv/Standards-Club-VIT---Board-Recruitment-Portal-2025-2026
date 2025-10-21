/**
 * Local Development Server
 * Simple Node.js server for testing the application locally
 * Serves static files from /public and handles API routes
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const PORT = process.env.PORT || 3000;

// Import API handlers
const getPositionsHandler = require('./api/get-positions.js');
const submitApplicationHandler = require('./api/submit-application.js');

// Helper function to wrap Express-style response for Node.js http
function wrapResponse(res) {
  res.status = function(code) {
    res.statusCode = code;
    return this;
  };
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return this;
  };
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

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // Wrap response for Express-style methods
  wrapResponse(res);

  try {
    // Handle API routes
    if (req.url.startsWith('/api/admin/login')) {
      // Parse POST body
      if (req.method === 'POST') {
        await parseBody(req);
      }
      const adminLoginHandler = require('./api/admin/login.js');
      return await adminLoginHandler(req, res);
    }
    
    if (req.url.startsWith('/api/admin/get-applications')) {
      const adminAppsHandler = require('./api/admin/get-applications.js');
      return await adminAppsHandler(req, res);
    }
    
    if (req.url.startsWith('/api/get-positions')) {
      return await getPositionsHandler(req, res);
    }
    
    if (req.url.startsWith('/api/submit-application')) {
      // Parse POST body for form submission
      if (req.method === 'POST') {
        await parseBody(req);
      }
      return await submitApplicationHandler(req, res);
    }

    // Serve static files from /public
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Handle /admin/ directory - serve admin/index.html
    if (req.url === '/admin' || req.url === '/admin/') {
      filePath = '/admin/index.html';
    }
    
    filePath = path.join(__dirname, 'public', filePath);
    
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // File not found
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - File Not Found</h1>', 'utf-8');
        } else {
          // Server error
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`, 'utf-8');
        }
      } else {
        // Success
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', message: error.message }));
  }
});

server.listen(PORT, () => {
  // Server started
});

// Graceful shutdown
process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});
