#!/usr/bin/env node
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const { networkInterfaces } = require('os');

function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

function generateQR(port, label) {
  const ip = getLocalIP();
  const url = `http://${ip}:${port}`;
  
  console.log(chalk.cyan(`\n${label}:`));
  console.log(chalk.blue(`🔗 ${url}`));
  qrcode.generate(url, { small: true });
}

// Generate QR codes for common ports
const services = [
  { port: 5500, label: '📱 Mobile Dashboard' },
  { port: 3000, label: '⚡ React Preview' },
  { port: 3001, label: '🔧 API Server' },
  { port: 8080, label: '🌐 Static Server' }
];

console.log(chalk.green.bold('\n📲 Mobile Development QR Codes\n'));

services.forEach(service => {
  generateQR(service.port, service.label);
});

console.log(chalk.dim('\nTip: Scan with your phone camera to open instantly'));
