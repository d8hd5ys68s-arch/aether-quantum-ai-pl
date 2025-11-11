# 🚀 Production Deployment Guide

Complete step-by-step guide for deploying Aether AI to production on Vercel.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [  ] GitHub repository with latest code
- [ ] Google Gemini API key ([Get here](https://aistudio.google.com/app/apikey))
- [ ] Vercel account ([Sign up](https://vercel.com/signup))
- [ ] Domain name (optional, but recommended)

---

## 🎯 Quick Deploy (5 Minutes)

### Step 1: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/d8hd5ys68s-arch/ItsAetherAI)

Or manually:

1. **Go to** [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repository
3. **Click** "Deploy" (will fail initially - expected)

### Step 2: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

**Required:**
```bash
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
GOOGLE_GENAI_API_KEY=<your-google-ai-api-key>
```

**Optional (Hedera):**
```bash
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e...
HEDERA_TOPIC_ID=0.0.xxxxx
HEDERA_NETWORK=testnet
```

### Step 3: Create Postgres Database

1. Go to **Storage** tab in Vercel
2. Click **Create Database**
3. Select **Postgres**
4. Name it `aether-db`
5. Click **Create**

This auto-injects: `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc.

### Step 4: Initialize Database

1. In Vercel Dashboard → Storage → Postgres → **Query** tab
2. Copy entire contents of `lib/db/schema.sql`
3. Paste and click **Run Query**

### Step 5: Create Blob Storage (Optional)

1. Go to **Storage** tab
2. Click **Create Database**
3. Select **Blob**
4. Name it `aether-blob`
5. Click **Create**

This auto-injects: `BLOB_READ_WRITE_TOKEN`

### Step 6: Redeploy

1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Wait 1-2 minutes
5. 🎉 Your app is live!

---

## 🔒 Security Checklist

After deployment, verify:

- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Security headers are set (check /api/health)
- [ ] Rate limiting is working
- [ ] Environment variables are not exposed in client code
- [ ] Database connection uses SSL
- [ ] API endpoints require authentication where needed
- [ ] CORS is properly configured

---

## 🏥 Health Check

After deployment, test your endpoints:

### 1. Health Check
```bash
curl https://your-project.vercel.app/api/health
```

**Expected response** (200 OK):
```json
{
  "status": "healthy",
  "services": {
    "database": true,
    "ai": true,
    "auth": true
  }
}
```

### 2. Create Account
Visit: `https://your-project.vercel.app`
1. Click "Sign Up"
2. Create an account
3. Verify you can log in

### 3. Test AI Chat
1. Log in
2. Send a test message
3. Verify AI responds

### 4. Check Metrics (Optional)
```bash
curl https://your-project.vercel.app/api/metrics \
  -H "Cookie: <your-session-cookie>"
```

---

## 🌐 Custom Domain (Optional)

### Add Domain in Vercel

1. Go to **Settings** → **Domains**
2. Enter your domain (e.g., `www.itsaether.ai`)
3. Click **Add**
4. Follow DNS configuration instructions

### Update Environment Variable

After domain is added:

1. Go to **Settings** → **Environment Variables**
2. Edit `NEXTAUTH_URL`
3. Change to: `https://www.itsaether.ai`
4. Save and **Redeploy**

### DNS Configuration

**For root domain (itsaether.ai):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain (www.itsaether.ai):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Wait 5-10 minutes for DNS propagation.

---

## 📊 Monitoring & Analytics

### Built-in Monitoring

Vercel provides automatic monitoring:
- Function logs
- Error tracking
- Performance metrics
- Speed Insights

Access in: **Vercel Dashboard → Analytics**

### Health Checks

Set up external monitoring with:
- [UptimeRobot](https://uptimerobot.com) - Free tier available
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

**Monitor endpoint:** `https://your-domain.com/api/health`

### Custom Metrics

Access detailed metrics:
```bash
curl https://your-domain.com/api/metrics \
  -H "Cookie: <session-cookie>"
```

---

## 🔧 Environment Variables Reference

### Required for Production

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NEXTAUTH_URL` | Your deployment URL | Vercel deployment URL |
| `NEXTAUTH_SECRET` | Random secret (32+ chars) | `openssl rand -base64 32` |
| `GOOGLE_GENAI_API_KEY` | Google AI API key | [AI Studio](https://aistudio.google.com/app/apikey) |

### Auto-Injected by Vercel

These are automatically added when you create databases:

| Variable | Source |
|----------|--------|
| `POSTGRES_URL` | Postgres database |
| `POSTGRES_PRISMA_URL` | Postgres database |
| `POSTGRES_URL_NO_SSL` | Postgres database |
| `POSTGRES_URL_NON_POOLING` | Postgres database |
| `BLOB_READ_WRITE_TOKEN` | Blob storage |

### Optional (Hedera Blockchain)

| Variable | Description |
|----------|-------------|
| `HEDERA_ACCOUNT_ID` | Testnet account ID |
| `HEDERA_PRIVATE_KEY` | Account private key |
| `HEDERA_TOPIC_ID` | Consensus topic ID |
| `HEDERA_NETWORK` | `testnet` or `mainnet` |

---

## 🚨 Troubleshooting

### Build Fails

**Issue:** Build fails with "Module not found"
**Solution:**
- Check that all dependencies are in `package.json`
- Vercel auto-installs dependencies
- Check build logs in Vercel dashboard

**Issue:** TypeScript errors
**Solution:**
- Fix type errors locally first
- Run `npm run typecheck` before pushing
- Check `tsconfig.json` configuration

### Environment Variables

**Issue:** "Environment variable validation failed"
**Solution:**
- Check all required variables are set
- Verify `NEXTAUTH_SECRET` is 32+ characters
- Ensure `NEXTAUTH_URL` matches deployment URL
- See `lib/env.ts` for validation rules

### Database Errors

**Issue:** "Database connection failed"
**Solution:**
- Verify Postgres database is created
- Check `POSTGRES_URL` is set
- Run database schema in Query tab
- Check connection pooling settings

**Issue:** "Table does not exist"
**Solution:**
- Run `lib/db/schema.sql` in Vercel Postgres Query tab
- Verify all tables are created
- Check schema matches current version

### AI Not Responding

**Issue:** "AI service configuration error"
**Solution:**
- Verify `GOOGLE_GENAI_API_KEY` is set
- Test API key at [AI Studio](https://aistudio.google.com)
- Check API quota hasn't been exceeded
- Review function logs in Vercel

### Authentication Issues

**Issue:** "Authentication required" errors
**Solution:**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches deployment
- Redeploy after changing auth variables
- Clear browser cookies and retry

### Rate Limiting

**Issue:** "Rate limit exceeded"
**Solution:**
- Default: 100 requests per 15 minutes
- Wait for rate limit to reset
- Increase limits in `lib/middleware.ts`
- Check database rate limit table

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

1. **Push to main branch:**
   ```bash
   git push origin main
   ```

2. **Vercel detects push**
3. **Builds and deploys automatically**
4. **Live in 1-2 minutes**

### Preview Deployments

Every pull request gets a preview deployment:
- Unique URL for testing
- Same environment as production
- Automatic cleanup after PR closes

### Rollback

If deployment fails:

1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **...** → **Promote to Production**

---

## 📈 Performance Optimization

### Enable Speed Insights

Already enabled via `@vercel/speed-insights/next` in `app/layout.tsx`

View metrics: **Vercel Dashboard → Speed Insights**

### Caching

Static assets are automatically cached:
- Next.js static files: 1 year
- Images: Optimized automatically
- API responses: Not cached (dynamic)

### Database Optimization

1. **Connection pooling:** Already configured via Vercel Postgres
2. **Indexes:** Review `lib/db/schema.sql` for indexes
3. **Query optimization:** Check slow queries in Vercel logs

### Function Configuration

Function timeouts configured in `vercel.json`:
- Default: 10 seconds
- API routes: 30 seconds
- Upgrade plan for longer timeouts

---

## 🧪 Testing Production

### Manual Testing

1. **Homepage:** Verify animations and styling
2. **Sign Up:** Create test account
3. **Sign In:** Login with test account
4. **AI Chat:** Send test message
5. **File Upload:** Test avatar upload (if enabled)
6. **Speed:** Check page load times

### API Testing

```bash
# Health check
curl https://your-domain.com/api/health

# Chat (requires auth)
curl -X POST https://your-domain.com/api/chat/v2 \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"message": "Hello, Aether!"}'

# Metrics (requires auth)
curl https://your-domain.com/api/metrics \
  -H "Cookie: <session-cookie>"
```

### Load Testing

Use tools like:
- [k6](https://k6.io) - Open source load testing
- [Artillery](https://artillery.io) - Performance testing
- [Locust](https://locust.io) - Python-based load testing

---

## 📱 Mobile Optimization

Already optimized for mobile:
- ✅ Responsive design
- ✅ Touch-friendly UI
- ✅ Reduced animations on mobile
- ✅ Fast loading times
- ✅ Mobile-first approach

Test on:
- iOS Safari
- Android Chrome
- Various screen sizes

---

## 🎓 Best Practices

### Security
- Keep dependencies updated
- Rotate secrets regularly
- Use environment-specific keys
- Enable 2FA on Vercel account
- Monitor security advisories

### Performance
- Monitor Speed Insights
- Optimize images
- Minimize bundle size
- Use CDN for static assets
- Enable compression

### Monitoring
- Set up health check alerts
- Monitor error rates
- Track API usage
- Review logs regularly
- Set up incident response

### Maintenance
- Update dependencies monthly
- Review database growth
- Clean up old data
- Test after updates
- Document changes

---

## 📞 Support

### Documentation
- **DEPLOY.md:** Dual deployment guide
- **BACKEND.md:** Backend utilities guide
- **CLAUDE.md:** Development guide
- **README.md:** Project overview

### Resources
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Issues:** [Report bugs](https://github.com/d8hd5ys68s-arch/ItsAetherAI/issues)

### Emergency Contacts
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Status Page:** [vercel-status.com](https://www.vercel-status.com)

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Health check returns 200 OK
- [ ] All services show as healthy
- [ ] Can create new account
- [ ] Can log in successfully
- [ ] AI chat responds correctly
- [ ] Database queries working
- [ ] File uploads working (if enabled)
- [ ] Custom domain configured (if applicable)
- [ ] Speed Insights enabled
- [ ] Monitoring alerts set up
- [ ] Documentation updated
- [ ] Team notified

---

## 🎉 You're Live!

Congratulations! Your Aether AI platform is now running in production.

**Next steps:**
1. Share your deployment URL
2. Monitor performance
3. Gather user feedback
4. Plan future enhancements

**Production URL:** `https://your-project.vercel.app`
**Health Check:** `https://your-project.vercel.app/api/health`
**Metrics:** `https://your-project.vercel.app/api/metrics`

---

**Built with ❤️ using Next.js 15, Vercel, and Claude Code**
