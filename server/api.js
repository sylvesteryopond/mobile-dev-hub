const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/projects', async (req, res) => {
  try {
    const projectsDir = path.join(__dirname, '../projects');
    const projects = await fs.readdir(projectsDir);
    
    const projectsData = await Promise.all(
      projects.map(async (project) => {
        const projectPath = path.join(projectsDir, project);
        const stats = await fs.stat(projectPath);
        
        if (stats.isDirectory()) {
          const packageJsonPath = path.join(projectPath, 'package.json');
          let packageInfo = {};
          
          if (await fs.pathExists(packageJsonPath)) {
            packageInfo = await fs.readJson(packageJsonPath);
          }
          
          return {
            name: project,
            type: packageInfo.dependencies?.react ? 'react' : 'node',
            lastModified: stats.mtime,
            size: await getFolderSize(projectPath)
          };
        }
        return null;
      })
    );
    
    res.json({ projects: projectsData.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/project/start', (req, res) => {
  const { projectName } = req.body;
  const projectPath = path.join(__dirname, '../projects', projectName);
  
  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Start the project
  exec(`cd ${projectPath} && npm run dev`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting project: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  });
  
  res.json({ message: `Project ${projectName} starting...` });
});

app.get('/api/qr/:port', (req, res) => {
  const { port } = req.params;
  const { networkInterfaces } = require('os');
  
  const nets = networkInterfaces();
  let localIP = 'localhost';
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIP = net.address;
        break;
      }
    }
  }
  
  const url = `http://${localIP}:${port}`;
  res.json({ url, qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}` });
});

// Utility function
async function getFolderSize(folderPath) {
  let size = 0;
  
  const files = await fs.readdir(folderPath);
  
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = await fs.stat(filePath);
    
    if (stats.isDirectory()) {
      size += await getFolderSize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}

app.listen(PORT, () => {
  console.log(`🔧 API Server running on port ${PORT}`);
});
