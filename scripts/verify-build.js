#!/usr/bin/env node

/**
 * Build verification script for GitHub Pages deployment workflow
 * 
 * Creates a static landing page for GitHub Pages that showcases Aether AI
 * and redirects users to the full application on Vercel.
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
  console.log('📁 Created dist/ directory for GitHub Pages deployment');
}

// Create a professional landing page for GitHub Pages
const landingPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aether AI - Enterprise-Grade AI Platform</title>
  <meta name="description" content="Enterprise-grade AI platform built with Google Gemini 2.0 Flash and Hedera Consensus Service. Carbon-negative AI with blockchain-verified API tracking.">
  <meta property="og:title" content="Aether AI - Enterprise-Grade AI Platform">
  <meta property="og:description" content="Revolutionary AI platform powered by Google Gemini and Hedera blockchain technology">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Aether AI">
  <meta name="twitter:description" content="Enterprise-Grade AI Platform Built on Google Gemini & Hedera">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    /* Animated background effect */
    body::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
      animation: pulse 15s ease-in-out infinite;
      z-index: 0;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
    }
    
    .container {
      position: relative;
      z-index: 1;
      max-width: 800px;
      text-align: center;
      background: rgba(10, 10, 10, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 3rem;
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    
    .logo {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }
    
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #e5e5e5;
      font-weight: 600;
    }
    
    .description {
      font-size: 1.1rem;
      color: #a0a0a0;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
      text-align: left;
    }
    
    .feature {
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      transition: all 0.3s ease;
    }
    
    .feature:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(99, 102, 241, 0.3);
      transform: translateY(-2px);
    }
    
    .feature-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .feature-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #ffffff;
    }
    
    .feature-desc {
      font-size: 0.9rem;
      color: #808080;
      line-height: 1.4;
    }
    
    .cta-button {
      display: inline-block;
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      border: none;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
      margin-top: 1rem;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
    }
    
    .note {
      margin-top: 2rem;
      padding: 1rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 8px;
      font-size: 0.9rem;
      color: #c0c0c0;
    }
    
    .tech-stack {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }
    
    .tech-badge {
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      font-size: 0.85rem;
      color: #b0b0b0;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 2rem 1.5rem;
      }
      
      .logo {
        font-size: 2rem;
      }
      
      h1 {
        font-size: 1.2rem;
      }
      
      .description {
        font-size: 1rem;
      }
      
      .features {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ Aether AI</div>
    <h1>Enterprise-Grade AI Platform</h1>
    <p class="description">
      Revolutionary AI platform powered by Google Gemini 2.0 Flash and Hedera Consensus Service.
      Experience carbon-negative operations with blockchain-verified API tracking.
    </p>
    
    <div class="features">
      <div class="feature">
        <div class="feature-icon">🤖</div>
        <div class="feature-title">Google Gemini 2.0</div>
        <div class="feature-desc">Powered by the latest AI model from Google</div>
      </div>
      <div class="feature">
        <div class="feature-icon">🔗</div>
        <div class="feature-title">Hedera Blockchain</div>
        <div class="feature-desc">Immutable API call tracking on distributed ledger</div>
      </div>
      <div class="feature">
        <div class="feature-icon">🌱</div>
        <div class="feature-title">Carbon Negative</div>
        <div class="feature-desc">Eco-friendly operations with carbon offsets</div>
      </div>
      <div class="feature">
        <div class="feature-icon">🔒</div>
        <div class="feature-title">Enterprise Security</div>
        <div class="feature-desc">Full authentication & audit compliance</div>
      </div>
    </div>
    
    <a href="https://its-aether-ai.vercel.app" class="cta-button">
      Launch Application →
    </a>
    
    <div class="tech-stack">
      <span class="tech-badge">Next.js 15</span>
      <span class="tech-badge">React 19</span>
      <span class="tech-badge">TypeScript</span>
      <span class="tech-badge">PostgreSQL</span>
      <span class="tech-badge">Hedera SDK</span>
    </div>
    
    <div class="note">
      <strong>Note:</strong> This is a full-stack application with server-side features.
      The complete app with AI chat, authentication, and blockchain integration is hosted on Vercel.
    </div>
  </div>
  
  <script>
    // Optional: Auto-redirect after 5 seconds
    // setTimeout(() => {
    //   window.location.href = 'https://its-aether-ai.vercel.app';
    // }, 5000);
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), landingPageHtml);
console.log('✅ Created professional landing page in dist/index.html');

console.log('\n📊 Build verification summary:');
console.log('   - Next.js build: ✅ Complete');
console.log('   - Build output: .next/ directory');
console.log('   - GitHub Pages landing page: dist/ directory');
console.log('   - Static showcase page with Aether AI branding');
console.log('\n⚠️  Note: Full-stack features require Vercel deployment.');
console.log('   GitHub Pages serves a landing/showcase page.');
console.log('\n🚀 Build verification passed!\n');

process.exit(0);
