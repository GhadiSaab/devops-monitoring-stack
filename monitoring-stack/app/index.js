const express = require('express');
const client = require('prom-client');
const path = require('path');

const app = express();
const PORT = 3001;

// create prometheus registry
const register = new client.Registry();

// add default metrics (cpu, memory, etc)
client.collectDefaultMetrics({ register });

// custom metric: count requests
const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'total http requests',
  labelNames: ['method', 'route', 'status']
});
register.registerMetric(requestCounter);

// custom metric: request duration
const requestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'request duration in seconds',
  labelNames: ['method', 'route']
});
register.registerMetric(requestDuration);

// middleware to track requests
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    requestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    requestDuration.observe({ method: req.method, route: req.path }, duration);

    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}s`);
  });

  next();
});

// serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// metrics endpoint for prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// landing page - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.get('/slow', (req, res) => {
  // simulate slow endpoint
  setTimeout(() => {
    res.json({ message: 'this took 2 seconds' });
  }, 2000);
});

app.get('/error', (req, res) => {
  // simulate error
  console.error('ERROR: something went wrong');
  res.status(500).json({ error: 'internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`app running on port ${PORT}`);
  console.log(`metrics available at http://localhost:${PORT}/metrics`);
});
