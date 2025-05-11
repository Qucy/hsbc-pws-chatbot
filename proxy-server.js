const http = require("http");
const https = require("https");
const url = require("url");
const path = require("path");
const { chromium } = require('playwright');
const PORT = process.env.PORT || 30001; // Also good practice for port
const PUBLIC_PROXY_URL = process.env.PUBLIC_PROXY_URL || `http://localhost:${PORT}`; // Default for local dev

// Store base URL for resource rewriting
let baseUrl = '';
let baseUrlObj = null;

// Cache for browser and context to avoid creating new instances for each request
let browserInstance = null;
let contextInstance = null;

// Initialize browser and context
async function initBrowser() {
  if (!browserInstance) {
    console.log('Launching headless browser...');
    browserInstance = await chromium.launch({ headless: true });
    contextInstance = await browserInstance.newContext();
    console.log('Browser initialized successfully');
  }
  return { browser: browserInstance, context: contextInstance };
}

// Function to fetch content using Playwright
async function fetchWithPlaywright(targetUrl) {
  const { context } = await initBrowser();
  
  console.log(`Fetching content from: ${targetUrl}`);
  const page = await context.newPage();
  
  try {
    // Set base URL for resource rewriting
    baseUrl = targetUrl;
    baseUrlObj = new URL(targetUrl);
    
    // Navigate to the target URL
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('Network did not become idle, continuing anyway');
    });
    
    // Modify all links to go through our proxy
    await page.evaluate((proxyUrl) => {
      // Rewrite all links
      document.querySelectorAll('a').forEach(link => {
        if (link.href && link.href.startsWith('http')) {
          link.href = `${proxyUrl}?target=${encodeURIComponent(link.href)}`;
        }
      });
      
      // Rewrite all resource URLs
      document.querySelectorAll('link[rel="stylesheet"], script[src], img[src]').forEach(el => {
        if (el.src) {
          el.setAttribute('data-original-src', el.src);
        } else if (el.href) {
          el.setAttribute('data-original-href', el.href);
        }
      });
    }, PUBLIC_PROXY_URL); // Use the configured public URL
    
    // Get the HTML content
    const content = await page.content();
    
    // Get the content type
    const contentType = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Type"]');
      return meta ? meta.getAttribute('content') : 'text/html; charset=UTF-8';
    });
    
    // Close the page
    await page.close();
    
    return { content, contentType };
  } catch (error) {
    console.error(`Error fetching with Playwright: ${error.message}`);
    if (page) {
      await page.close().catch(() => {});
    }
    throw error;
  }
}

// Function to fetch a resource directly
async function fetchResource(resourceUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(resourceUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': baseUrl
      }
    };
    
    const req = protocol.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Function to resolve a relative URL against the base URL
function resolveUrl(relativeUrl) {
  if (!relativeUrl) return null;
  
  // If it's already an absolute URL, return it
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // If we have a base URL object, use it to resolve the relative URL
  if (baseUrlObj) {
    return new URL(relativeUrl, baseUrlObj.href).href;
  }
  
  // If we don't have a base URL object, try to resolve against the base URL string
  if (baseUrl) {
    return new URL(relativeUrl, baseUrl).href;
  }
  
  return null;
}

// Create the proxy server
const server = http.createServer(async (req, res) => {
  // Set CORS headers to allow iframe embedding
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse the URL
  const parsedUrl = url.parse(req.url, true);
  const targetUrl = parsedUrl.query.target;
  
  // If this is a request with a target parameter, it's a main page request
  if (targetUrl) {
    console.log(`Proxying main request to: ${targetUrl}`);
    
    try {
      // Fetch the content using Playwright
      const { content, contentType } = await fetchWithPlaywright(targetUrl);
      
      // Set response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *");
      
      // Send the response
      res.writeHead(200);
      res.end(content);
    } catch (error) {
      console.error(`Proxy error: ${error.message}`);
      res.writeHead(500);
      res.end(`Proxy error: ${error.message}`);
    }
    return;
  }
  
  // If we get here, it's a resource request (CSS, JS, images, etc.)
  // We need to resolve the resource URL against the base URL
  const resourcePath = parsedUrl.pathname;
  const resolvedResourceUrl = resolveUrl(resourcePath);
  
  if (!resolvedResourceUrl) {
    console.error(`Cannot resolve resource URL: ${resourcePath}`);
    res.writeHead(400);
    res.end(`Cannot resolve resource URL: ${resourcePath}`);
    return;
  }
  
  console.log(`Proxying resource request: ${resourcePath} -> ${resolvedResourceUrl}`);
  
  try {
    // Fetch the resource directly
    const { statusCode, headers, body } = await fetchResource(resolvedResourceUrl);
    
    // Remove security headers
    const responseHeaders = { ...headers };
    const fieldsToRemove = [
      'x-frame-options', 
      'content-security-policy',
      'content-security-policy-report-only',
      'frame-options'
    ];
    
    Object.keys(responseHeaders).forEach(field => {
      if (fieldsToRemove.includes(field.toLowerCase())) {
        delete responseHeaders[field];
      }
    });
    
    // Set response headers
    res.writeHead(statusCode, responseHeaders);
    res.end(body);
  } catch (error) {
    console.error(`Resource proxy error: ${error.message}`);
    res.writeHead(500);
    res.end(`Resource proxy error: ${error.message}`);
  }
});

// Start the server
server.listen(PORT, async () => {
  // Optionally update the log message too:
  console.log(`Proxy server running. Accessible at: ${PUBLIC_PROXY_URL}`);
  
  // Initialize the browser on startup
  try {
    await initBrowser();
  } catch (error) {
    console.error(`Failed to initialize browser: ${error.message}`);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error(`Server error: ${error.message}`);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  if (browserInstance) {
    await browserInstance.close();
  }
  process.exit(0);
});

