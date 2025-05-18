const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3001;
const TARGET_API_HOST = 'pws-user-api-1013020134920.asia-east2.run.app';

// Create the proxy server
const server = http.createServer((req, res) => {
  // Set CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse the request URL
  const parsedUrl = url.parse(req.url);
  
  // Only proxy requests that start with /api/
  if (!parsedUrl.pathname.startsWith('/api/')) {
    res.writeHead(404);
    res.end('Not Found: This proxy only handles API requests');
    return;
  }
  
  // Collect request body data if present
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });
  
  req.on('end', () => {
    body = Buffer.concat(body).toString();
    
    // Prepare the options for the proxied request
    const options = {
      hostname: TARGET_API_HOST,
      port: 443, // HTTPS port
      path: parsedUrl.pathname + (parsedUrl.search || ''),
      method: req.method,
      headers: {
        // Forward headers from the original request
        ...req.headers,
        host: TARGET_API_HOST
      }
    };
    
    // Remove headers that might cause issues
    delete options.headers['host'];
    delete options.headers['origin'];
    delete options.headers['referer'];
    
    console.log(`Proxying ${req.method} request to: https://${TARGET_API_HOST}${options.path}`);
    
    // Create the proxied request
    const proxyReq = https.request(options, (proxyRes) => {
      // Copy status code
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      
      // Pipe the response data back to the client
      proxyRes.pipe(res);
    });
    
    // Handle errors in the proxied request
    proxyReq.on('error', (error) => {
      console.error(`Proxy error: ${error.message}`);
      res.writeHead(500);
      res.end(`Proxy error: ${error.message}`);
    });
    
    // Send the request body if present
    if (body) {
      proxyReq.write(body);
    }
    
    // End the request
    proxyReq.end();
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`API Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to https://${TARGET_API_HOST}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error(`Server error: ${error.message}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down API proxy server...');
  process.exit(0);
});