#!/usr/bin/env node

/**
 * Build verification script for GitHub Pages deployment workflow
 * 
 * Note: This Next.js application is a full-stack app with API routes and cannot be
 * fully deployed to GitHub Pages. The recommended deployment target is Vercel.
 * This script exists for workflow compatibility only.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Next.js build output...\n');

// Check if .next directory exists (standard Next.js build output)
const nextBuildDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextBuildDir)) {
  console.error('❌ Error: .next directory not found. Please run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Next.js build directory found: .next/');

// Create dist directory for GitHub Pages workflow compatibility
const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('📁 Created dist/ directory for workflow compatibility');
}

// Create a placeholder index.html in dist
const placeholderHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aether AI - Redirect</title>
  <meta http-equiv="refresh" content="0; url=https://aether-ai.vercel.app">
</head>
<body>
  <h1>Aether AI</h1>
  <p>This is a full-stack Next.js application deployed on Vercel.</p>
  <p>Redirecting to <a href="https://aether-ai.vercel.app">https://aether-ai.vercel.app</a>...</p>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), placeholderHtml);
console.log('✅ Created redirect page in dist/index.html');

console.log('\n📊 Build verification summary:');
console.log('   - Next.js build: ✅ Complete');
console.log('   - Build output: .next/ directory');
console.log('   - Workflow compatibility: dist/ directory created');
console.log('\n⚠️  Note: This is a full-stack Next.js application with API routes.');
console.log('   For full functionality, deploy to Vercel (https://vercel.com)');
console.log('\n🚀 Build verification passed!\n');

process.exit(0);
