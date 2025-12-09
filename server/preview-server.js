const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from projects
app.use(express.static(path.join(__dirname, '../projects')));
app.use(express.static(path.join(__dirname, '../portal')));

// API endpoint to list projects
app.get('/api/projects', (req, res) => {
  const projectsDir = path.join(__dirname, '../projects');
  const projects = fs.readdirSync(projectsDir)
    .filter(item => fs.statSync(path.join(projectsDir, item)).isDirectory());
  
  res.json({ projects });
});

// Watch for file changes
const watcher = chokidar.watch([
  path.join(__dirname, '../projects/**/*'),
  path.join(__dirname, '../portal/**/*')
], {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true
});

io.on('connection', (socket) => {
  console.log('📱 Client connected');
  
  socket.on('disconnect', () => {
    console.log('📱 Client disconnected');
  });
});

watcher.on('change', (filePath) => {
  console.log(`🔄 File changed: ${path.relative(__dirname, filePath)}`);
  io.emit('file-change', {
    file: path.basename(filePath),
    timestamp: Date.now()
  });
});

server.listen(PORT, () => {
  console.log(`⚡ Preview Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT}/portal for mobile dashboard`);
});
