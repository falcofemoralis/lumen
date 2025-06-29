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

app.use(
  '/',
  createProxyMiddleware({
    target: 'https://rezka-ua.org',
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req, res) => {
        /* handle proxyReq */
        console.log('\nRequest: ', proxyReq.path);
      },
      proxyRes: (proxyRes, req, res) => {
        /* handle proxyRes */
        console.log('Response: ', proxyRes.statusCode);
      },
      error: (err, req, res) => {
        /* handle error */
        console.error('Proxy error:', err);
      },
    },
  })
);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
