const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:8081',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to proxy requests
const proxyMiddleware = createProxyMiddleware({
  changeOrigin: true,
  router: (req) => {
    // Example: get target from a custom header
    if (req.headers['x-proxy-target']) {
      return req.headers['x-proxy-target'];
    }

    // no target specified, error on client side
    return undefined;
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
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
