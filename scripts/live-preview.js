#!/usr/bin/env node
const chokidar = require('chokidar');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const PORT = 35729;
const clients = new Set();

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// Watch for changes in templates and portal
const watcher = chokidar.watch([
  'templates/**/*',
  'portal/**/*',
  'public/**/*'
], {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', (filePath) => {
  console.log(`🔄 ${filePath} changed`);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'reload',
        file: path.basename(filePath)
      }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🔧 Live Preview Server running on port ${PORT}`);
});

// Inject script into HTML files
const injectScript = `
<script>
  const ws = new WebSocket('ws://localhost:${PORT}');
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'reload') {
      window.location.reload();
    }
  };
  console.log('🔄 Live reload enabled');
</script>
`;

console.log(`📝 Add this to your HTML files: ${injectScript}`);
