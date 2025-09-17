const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

app.use((req, res, next) => {
  if (!req.headers['x-forwarded-host']) {
    return res.status(400).json({ error: 'Missing X-Forwarded-Host header' });
  }
  next();
});

// Middleware to proxy requests
const proxyMiddleware = createProxyMiddleware({
  changeOrigin: true,
  router: (req) => {
    // set the target based on the host header
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-Host
    return req.headers['x-forwarded-host'];
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
      proxyReq.removeHeader('x-forwarded-host');
      console.log('\nRequest: ', proxyReq.path);
    },
    proxyRes: (proxyRes, req, res) => {
      console.log('Response: ', proxyRes.statusCode);
    },
    error: (err, req, res) => {
      console.error('Proxy error:', err);
    },
  },
});

app.use('/', proxyMiddleware);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
