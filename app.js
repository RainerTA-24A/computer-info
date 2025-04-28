const http = require('http');
const os = require('os');
const process = require('process');
const url = require('url');

// Format bytes
function formatBytes(bytes, decimal = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i))).toFixed(decimal) + ' ' + sizes[i];
}

// Format seconds
function formatTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
}

// CPU Info
const getCpuInfo = () => ({
  model: os.cpus()[0].model,
  cores: os.cpus().length,
  architecture: os.arch(),
  loadAvg: os.loadavg()
});

// Memory Info
const getMemoryInfo = () => ({
  total: formatBytes(os.totalmem()),
  free: formatBytes(os.freemem()),
  usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + '%'
});

// OS Info
const getOsInfo = () => ({
  platform: os.platform(),
  type: os.type(),
  release: os.release(),
  hostname: os.hostname(),
  uptime: formatTime(os.uptime())
});

// User Info
const getUserInfo = () => os.userInfo();

// Network Info
const getNetworkInfo = () => os.networkInterfaces();

// Process Info
const getProcessInfo = () => ({
  pid: process.pid,
  title: process.title,
  nodeVersion: process.version,
  uptime: formatTime(process.uptime()),
  memoryUsage: {
    rss: formatBytes(process.memoryUsage().rss),
    heapTotal: formatBytes(process.memoryUsage().heapTotal),
    heapUsed: formatBytes(process.memoryUsage().heapUsed),
    external: formatBytes(process.memoryUsage().external)
  },
  env: {
    NODE_ENV: process.env.NODE_ENV || 'Not set'
  }
});

// Build HTML page
function buildHtmlPage(data) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SysView Dashboard</title>
<style>
  body { font-family: Arial, sans-serif; background-color: #121212; color: #f0f0f0; margin: 20px; }
  h1 { color: #00bfff; }
  .section { background: #1e1e1e; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
  pre { background: #2e2e2e; padding: 10px; border-radius: 5px; overflow-x: auto; }
</style>
</head>
<body>
<h1>SysView - System Information</h1>

<div class="section">
  <h2>CPU Info</h2>
  <pre>${JSON.stringify(data.cpu, null, 2)}</pre>
</div>

<div class="section">
  <h2>Memory Info</h2>
  <pre>${JSON.stringify(data.memory, null, 2)}</pre>
</div>

<div class="section">
  <h2>OS Info</h2>
  <pre>${JSON.stringify(data.os, null, 2)}</pre>
</div>

<div class="section">
  <h2>User Info</h2>
  <pre>${JSON.stringify(data.user, null, 2)}</pre>
</div>

<div class="section">
  <h2>Process Info</h2>
  <pre>${JSON.stringify(data.process, null, 2)}</pre>
</div>

<div class="section">
  <h2>Network Info</h2>
  <pre>${JSON.stringify(data.network, null, 2)}</pre>
</div>

</body>
</html>
  `;
}

// Create server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/') {
    // Serve HTML dashboard
    const data = {
      cpu: getCpuInfo(),
      memory: getMemoryInfo(),
      os: getOsInfo(),
      user: getUserInfo(),
      process: getProcessInfo(),
      network: getNetworkInfo()
    };

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(buildHtmlPage(data));

  } else if (parsedUrl.pathname === '/api') {
    // Serve raw JSON if needed
    const data = {
      cpu: getCpuInfo(),
      memory: getMemoryInfo(),
      os: getOsInfo(),
      user: getUserInfo(),
      process: getProcessInfo(),
      network: getNetworkInfo()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));

  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

// Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`SysView is running at http://localhost:${PORT}`);
});
