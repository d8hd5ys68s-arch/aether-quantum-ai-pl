# Deployment Guide

This document provides detailed information about deploying the Aether AI application.

## Overview

**⚠️ IMPORTANT: Aether AI is a full-stack Next.js application and requires server-side hosting.**

The Aether AI platform is built with:
- **Next.js 15** with App Router
- **React 19** + **TypeScript**
- **Vercel Postgres** (database)
- **NextAuth.js v5** (authentication)
- **Google Gemini API** (AI backend)
- **Hedera Hashgraph** (blockchain integration)

## Recommended Deployment: Vercel

Aether AI is designed to be deployed on **Vercel** for full functionality. See [README.md](README.md#-deployment) for complete deployment instructions.

**Why Vercel?**
- Full-stack Next.js support (API routes, server actions)
- Integrated Postgres database
- Automatic environment variable injection
- Zero-config deployment
- Global CDN and edge network

## GitHub Pages Limitation

**Note:** The GitHub Pages deployment workflow (`.github/workflows/deploy.yml`) exists for legacy compatibility but has significant limitations:

- ❌ **Cannot run API routes** (authentication, AI chat, Hedera integration)
- ❌ **Cannot connect to database** (PostgreSQL)
- ❌ **Cannot use server-side features** (NextAuth, server actions)
- ✅ **Can only serve static redirect page** to the Vercel deployment

### GitHub Pages Workflow

The workflow performs these steps:
1. Builds Next.js application (`npm run build`)
2. Verifies build output (`npm run verify-build`)
3. Creates `dist/` directory with redirect page to Vercel
4. Deploys redirect page to GitHub Pages at `www.itsaether.ai`

**Build Command:**
```bash
npm run build
```

**Verify Command:**
```bash
npm run verify-build
```

**Output Structure:**
```
dist/
├── index.html           # Redirect page to Vercel deployment
└── CNAME               # Custom domain configuration
```

## Automated Deployment (GitHub Pages)

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

The GitHub Pages deployment is automated but only serves as a redirect:

```yaml
on:
  push:
    branches:
      - main  # Triggers on push to main branch
  workflow_dispatch:  # Manual trigger option
```

**Workflow Steps:**
1. **Checkout** - Clone the repository
2. **Setup Node** - Install Node.js 20
3. **Install dependencies** - Run `npm ci`
4. **Build** - Run `npm run build` (Next.js build to .next/)
5. **Verify build** - Run `npm run verify-build` (creates dist/ with redirect)
6. **Copy CNAME** - Ensure custom domain is preserved
7. **Upload artifact** - Prepare `dist/` for deployment
8. **Deploy** - Deploy redirect page to GitHub Pages

### What Gets Deployed to GitHub Pages?

✅ **Deployed to GitHub Pages:**
- `dist/index.html` - Redirect page to Vercel
- `CNAME` - Custom domain configuration

❌ **NOT Available on GitHub Pages:**
- API routes (authentication, AI chat, Hedera)
- Database connectivity
- Server-side features
- Full application functionality

**For full application access, visit the Vercel deployment.**

## Vercel Deployment (Recommended)

See [README.md](README.md#vercel-deployment-recommended) for complete Vercel deployment instructions.

Quick steps:
1. Push to GitHub
2. Import to Vercel
3. Add Vercel Postgres
4. Configure environment variables
5. Deploy

## Manual Build Verification

If you need to manually verify the build:

### 1. Build the Application

```bash
npm run build
```

This creates the `.next/` directory with the Next.js production build.

### 2. Verify Build Output

```bash
npm run verify-build
```

This script:
- ✅ Checks that `.next/` folder exists
- ✅ Creates `dist/` folder with redirect page
- ✅ Provides build verification summary

**Expected Output:**
```
🔍 Verifying Next.js build output...

✅ Next.js build directory found: .next/
📁 Created dist/ directory for workflow compatibility
✅ Created redirect page in dist/index.html

📊 Build verification summary:
   - Next.js build: ✅ Complete
   - Build output: .next/ directory
   - Workflow compatibility: dist/ directory created

⚠️  Note: This is a full-stack Next.js application with API routes.
   For full functionality, deploy to Vercel (https://vercel.com)

🚀 Build verification passed!
```

### 3. Test Locally

```bash
# Development mode
npm run dev

# Production mode (requires build first)
npm run build
npm run start
```

## Troubleshooting

### Build Failures

**Symptom:** `npm run build` fails

**Common causes:**
1. **Network issues:** Cannot fetch Google Fonts or external resources
2. **Missing environment variables:** Check `.env.local`
3. **TypeScript errors:** Run `npm run typecheck` first
4. **Dependency issues:** Run `npm ci` to clean install

**Solutions:**
1. Check error messages carefully
2. Ensure all environment variables are set
3. Run `npm run lint` and `npm run typecheck`
4. Try `rm -rf node_modules .next && npm ci && npm run build`

### Verify Build Failures

**Symptom:** `npm run verify-build` fails

**Cause:** No `.next/` directory found (build didn't run or failed)

**Solution:**
1. Run `npm run build` first
2. Check build completed successfully
3. Verify `.next/` directory exists

### GitHub Pages Shows Redirect

**Expected Behavior:** GitHub Pages (`www.itsaether.ai`) shows a redirect page.

**Why?** This is a full-stack Next.js application that requires:
- Server-side API routes
- Database connections
- Authentication
- Real-time AI processing

**Solution:** Access the full application at the Vercel deployment URL.

### Vercel Deployment Issues

See [README.md](README.md#-deployment) for Vercel-specific troubleshooting.

## Verification Checklist

### Before Deployment

- [ ] Build completes without errors: `npm run build`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Linting passes: `npm run lint`
- [ ] Verification passes: `npm run verify-build`
- [ ] Environment variables configured

### After Vercel Deployment

- [ ] Site loads at Vercel URL
- [ ] Authentication works (sign up/login)
- [ ] AI chat interface responds
- [ ] Database connections working
- [ ] No console errors
- [ ] Environment variables set correctly

### After GitHub Pages Deployment

- [ ] GitHub Actions workflow completed successfully
- [ ] Redirect page loads at `https://www.itsaether.ai`
- [ ] Redirects to Vercel deployment
- [ ] Custom domain configured correctly

## Deployment Targets

| Feature | Vercel | GitHub Pages |
|---------|--------|--------------|
| **Static Pages** | ✅ | ✅ (redirect only) |
| **API Routes** | ✅ | ❌ |
| **Authentication** | ✅ | ❌ |
| **Database** | ✅ | ❌ |
| **AI Processing** | ✅ | ❌ |
| **Hedera Integration** | ✅ | ❌ |
| **Full Functionality** | ✅ | ❌ |

**Recommendation:** Deploy to Vercel for production use.

## GitHub Pages Settings

If maintaining the GitHub Pages redirect:

1. Go to repository Settings → Pages
2. **Source:** GitHub Actions
3. **Custom domain:** `www.itsaether.ai` (optional)
4. **Enforce HTTPS:** ✅ Enabled

## Development vs Production

### Development (`npm run dev`)
- Next.js development server
- Hot module replacement
- Real-time TypeScript checking
- Serves on `http://localhost:9002`
- Uses `.env.local` for environment variables

### Production (`npm run build` + `npm run start`)
- Optimized production build
- Server-side rendering
- API routes enabled
- Requires all environment variables
- Minified and optimized code

### GitHub Pages (`npm run verify-build`)
- Creates redirect page only
- No server-side functionality
- Points to Vercel deployment
- Suitable only for domain redirect

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [NextAuth.js Documentation](https://authjs.dev)
- [README.md](README.md) - Complete project documentation

## Support

If you encounter deployment issues:
1. Check GitHub Actions logs for build errors
2. Run `npm run verify-build` locally
3. Review error messages in the console
4. See troubleshooting section above
5. Check [README.md](README.md) for detailed setup instructions
