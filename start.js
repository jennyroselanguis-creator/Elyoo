#!/usr/bin/env node

/**
 * Quick Start Script for Elyoo React App
 * Run this to set up and start the development server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 Elyoo Mobile Devices - React App Setup\n');

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...\n');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('\n✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed.\n');
}

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...\n');
  try {
    const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ .env file created!\n');
  } catch (error) {
    console.log('⚠️  Could not create .env file. Please copy .env.example to .env manually.\n');
  }
}

console.log('🎯 Starting development server...\n');
console.log('📍 App will open at: http://localhost:3000\n');
console.log('💡 Press Ctrl+C to stop the server\n');

try {
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  if (error.signal !== 'SIGINT') {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
