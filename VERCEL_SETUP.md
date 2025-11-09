# Vercel Deployment & Setup Guide

Complete guide for deploying Aether AI to Vercel with Blob storage and Speed Insights.

## 📦 Prerequisites

### 1. Install Vercel CLI

```bash
# Install globally
npm install -g vercel

# Verify installation
vercel --version
```

### 2. Login to Vercel

```bash
vercel login
# Follow the prompts to authenticate
```

---

## 🚀 Quick Deployment

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Go to** [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repository
3. **Configure** (auto-detected):
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Add Environment Variables** (see below)
5. **Deploy**

### Option B: Deploy via CLI

```bash
# Link your project to Vercel
vercel link

# Pull environment variables from Vercel (after setting them up)
vercel env pull .env.local

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 🔐 Environment Variables

### Required Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<run: openssl rand -base64 32>

# Google Gemini AI
GOOGLE_GENAI_API_KEY=<get from https://aistudio.google.com/app/apikey>

# Vercel Postgres (auto-injected when you add database)
POSTGRES_URL=<auto-injected>
POSTGRES_PRISMA_URL=<auto-injected>
POSTGRES_URL_NON_POOLING=<auto-injected>
POSTGRES_USER=<auto-injected>
POSTGRES_HOST=<auto-injected>
POSTGRES_PASSWORD=<auto-injected>
POSTGRES_DATABASE=<auto-injected>

# Vercel Blob (auto-injected when you connect Blob store)
BLOB_READ_WRITE_TOKEN=<auto-injected>
```

### Optional Variables (Hedera)

```bash
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e...
HEDERA_TOPIC_ID=0.0.xxxxx
```

---

## 🗄️ Database Setup

### 1. Create Vercel Postgres Database

**Via Dashboard:**
1. Go to your project
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Choose a name: `aether-db`
6. Select region closest to you
7. Click **"Create"**

**Via CLI:**
```bash
vercel env add POSTGRES_URL
# Follow prompts
```

### 2. Run Database Schema

**Via Vercel Dashboard:**
1. Go to **Storage** → Your Postgres Database
2. Click **"Query"** tab
3. Copy contents of `lib/db/schema.sql`
4. Paste and click **"Run Query"**

**Via Local CLI:**
```bash
# After pulling env with `vercel env pull`
npm run db:migrate  # (create this script if needed)
```

---

## 📦 Vercel Blob Storage Setup

### 1. Connect Blob Store

**Via Dashboard:**
1. Go to **Storage** tab
2. Click **"Create Database"**
3. Select **"Blob"**
4. Name it: `aether-blob`
5. Click **"Create"**
6. Token auto-injected as `BLOB_READ_WRITE_TOKEN`

**Vercel automatically:**
- Creates the blob store
- Injects `BLOB_READ_WRITE_TOKEN` environment variable
- Enables your upload endpoints

### 2. Test Upload

1. Deploy your app
2. Visit: `https://your-app.vercel.app/avatar/upload`
3. Upload an image
4. Get public CDN URL

### 3. View Uploaded Files

**Via Dashboard:**
1. Go to **Storage** → Blob
2. View all uploaded files
3. Copy URLs, delete files, etc.

**Via CLI:**
```bash
# List blobs
vercel blob list

# View specific blob
vercel blob get <blob-url>

# Delete blob
vercel blob delete <blob-url>
```

---

## 📊 Speed Insights Setup

### 1. Enable Speed Insights

**SpeedInsights is already integrated in your code** (`app/layout.tsx`).

To start seeing data:
1. Deploy your app
2. Visit your live site
3. Navigate around (generates data)
4. Go to **Vercel Dashboard** → **Analytics** → **Speed Insights**

### 2. View Performance Data

**Dashboard shows:**
- Real Experience Score (RES)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Time to First Byte (TTFB)

**Filter by:**
- Device type (mobile/desktop)
- Environment (production/preview)
- Time range
- Geographic location
- Individual routes

### 3. Analyze & Optimize

Speed Insights automatically tracks:
- All pages
- All deployments
- Real user data (not synthetic)

Use the data to:
- Identify slow pages
- Compare preview vs production
- Track performance over time
- Correlate with deployment changes

---

## 🔧 Local Development

### 1. Link to Vercel Project

```bash
# In your project directory
vercel link
# Select your project
```

### 2. Pull Environment Variables

```bash
# Download all environment variables
vercel env pull .env.local

# This creates .env.local with:
# - Database connection strings
# - Blob storage token
# - All your custom env vars
```

### 3. Run Development Server

```bash
npm run dev
# Runs on http://localhost:9002
```

### 4. Test with Production Data

Your local environment now has:
- ✅ Production database access
- ✅ Production blob storage access
- ✅ All environment variables

**⚠️ Warning:** Be careful! You're using production data.

For safety, create separate databases for development:
```bash
# In Vercel Dashboard
Storage → Create Database → Postgres (dev)
Storage → Create Database → Blob (dev)

# Set environment-specific variables
vercel env add POSTGRES_URL development
vercel env add BLOB_READ_WRITE_TOKEN development
```

---

## 📱 Custom Domain

### 1. Add Domain in Vercel

1. Go to **Settings** → **Domains**
2. Enter your domain: `aether.yourdomain.com`
3. Follow DNS configuration instructions

### 2. Configure DNS

Add these records to your DNS provider:

**For subdomain (recommended):**
```
Type: CNAME
Name: aether
Value: cname.vercel-dns.com
```

**For apex domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

### 3. Update Environment Variables

```bash
# Update NEXTAUTH_URL to your custom domain
NEXTAUTH_URL=https://aether.yourdomain.com
```

### 4. Redeploy

Changes take effect immediately. SSL certificate auto-provisioned.

---

## 🐛 Troubleshooting

### Issue: `vercel: command not found`

**Solution:**
```bash
npm install -g vercel
# or
yarn global add vercel
# or
pnpm add -g vercel
```

### Issue: Build fails on Vercel

**Check:**
1. Run `npm run build` locally
2. Check Vercel build logs for errors
3. Verify all environment variables are set
4. Check Node.js version matches

**Fix:**
```bash
# In package.json, specify Node version
{
  "engines": {
    "node": "18.x"
  }
}
```

### Issue: Database connection error

**Solution:**
1. Verify Postgres is connected to your project
2. Check environment variables are set
3. Run database schema
4. Redeploy

```bash
# Check connection locally
vercel env pull .env.local
npm run dev
# Try connecting to database
```

### Issue: Blob upload fails

**Solution:**
1. Verify Blob store is connected
2. Check `BLOB_READ_WRITE_TOKEN` is set
3. Check file size (100MB default limit)
4. Check content type validation

```bash
# Test in development
vercel env pull .env.local
npm run dev
# Visit /avatar/upload
```

### Issue: Speed Insights shows no data

**Wait Time:** Data can take 5-10 minutes to appear

**Requirements:**
- Must be deployed to production
- Need real user visits
- `@vercel/speed-insights` package installed
- Component added to layout

**Check:**
```bash
# Verify package is installed
npm list @vercel/speed-insights

# Verify component is in layout
grep -r "SpeedInsights" app/layout.tsx
```

---

## 📚 Vercel CLI Commands

```bash
# Project
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel link              # Link local project to Vercel
vercel ls                # List deployments

# Environment Variables
vercel env ls            # List all env vars
vercel env add           # Add new env var
vercel env rm            # Remove env var
vercel env pull          # Download env vars

# Logs
vercel logs              # View deployment logs
vercel logs --follow     # Stream logs

# Storage
vercel blob list         # List blobs
vercel blob delete       # Delete blob

# Secrets
vercel secrets ls        # List secrets
vercel secrets add       # Add secret
vercel secrets rm        # Remove secret
```

---

## 🎯 Deployment Checklist

### Before First Deployment

- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Logged in: `vercel login`
- [ ] Environment variables prepared
- [ ] Database schema ready

### First Deployment

- [ ] Deploy: `vercel --prod` or via dashboard
- [ ] Create Postgres database in Vercel
- [ ] Run database schema
- [ ] Create Blob store in Vercel
- [ ] Set environment variables
- [ ] Update `NEXTAUTH_URL` with deployment URL
- [ ] Redeploy

### Testing

- [ ] Visit homepage
- [ ] Test authentication (signup/login)
- [ ] Test AI chat
- [ ] Test file upload at `/avatar/upload`
- [ ] Check Speed Insights (wait 10 min for data)
- [ ] Verify database connections
- [ ] Check build logs for warnings

### Production Checklist

- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Environment variables for production set
- [ ] Database backups enabled
- [ ] Monitoring configured
- [ ] Error tracking working
- [ ] Performance optimized

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Blob Storage Docs**: https://vercel.com/docs/storage/vercel-blob
- **Postgres Docs**: https://vercel.com/docs/storage/vercel-postgres
- **Speed Insights Docs**: https://vercel.com/docs/speed-insights
- **Environment Variables**: https://vercel.com/docs/projects/environment-variables

---

## 💡 Best Practices

### Security
- ✅ Never commit `.env.local` to git
- ✅ Use environment-specific variables (dev/preview/production)
- ✅ Rotate secrets regularly
- ✅ Enable authentication before file uploads
- ✅ Use Vercel Firewall for DDoS protection

### Performance
- ✅ Use client-side uploads for large files
- ✅ Enable caching with `cacheControlMaxAge`
- ✅ Use `addRandomSuffix: true` for immutability
- ✅ Monitor Speed Insights regularly
- ✅ Optimize images before upload

### Cost Optimization
- ✅ Use client uploads (no data transfer charges)
- ✅ Delete unused blobs regularly
- ✅ Set appropriate cache headers
- ✅ Monitor storage usage
- ✅ Use preview deployments sparingly

---

## 🆘 Need Help?

- **Vercel Support**: https://vercel.com/support
- **Community**: https://github.com/vercel/vercel/discussions
- **Status**: https://www.vercel-status.com/
