# ✅ Aether AI - Production Deployment Checklist

Use this checklist to deploy to production. Check off each step as you complete it.

---

## 🎯 Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] Google Gemini API key obtained
- [ ] Vercel account created

---

## 🚀 Vercel Deployment

### 1. Initial Deploy
- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Import GitHub repository
- [ ] Click "Deploy" (will fail initially - expected)

### 2. Environment Variables
In Vercel → Settings → Environment Variables, add:

- [ ] `NEXTAUTH_URL` = Your Vercel URL
- [ ] `NEXTAUTH_SECRET` = (Generate: `openssl rand -base64 32`)
- [ ] `GOOGLE_GENAI_API_KEY` = Your Google AI key

**Optional (Hedera):**
- [ ] `HEDERA_ACCOUNT_ID`
- [ ] `HEDERA_PRIVATE_KEY`
- [ ] `HEDERA_TOPIC_ID`
- [ ] `HEDERA_NETWORK` = `testnet`

### 3. Postgres Database
- [ ] Storage → Create Database → Postgres
- [ ] Name: `aether-db`
- [ ] Click "Create"
- [ ] Note: Auto-injects POSTGRES_* variables

### 4. Initialize Database
- [ ] Go to Storage → Postgres → Query tab
- [ ] Copy entire contents of `lib/db/schema.sql`
- [ ] Paste and click "Run Query"
- [ ] Verify tables created (users, chat_messages, hedera_transactions)

### 5. Blob Storage (Optional)
- [ ] Storage → Create Database → Blob
- [ ] Name: `aether-blob`
- [ ] Click "Create"
- [ ] Note: Auto-injects BLOB_READ_WRITE_TOKEN

### 6. Redeploy
- [ ] Deployments → Click "..." on latest
- [ ] Click "Redeploy"
- [ ] Wait 1-2 minutes
- [ ] Check build logs for errors

---

## 🧪 Testing

### 1. Health Check
- [ ] Visit: `https://your-project.vercel.app/api/health`
- [ ] Verify status: `"healthy"`
- [ ] Check all services: `true`

### 2. User Authentication
- [ ] Visit homepage
- [ ] Click "Sign Up"
- [ ] Create test account
- [ ] Verify email confirmation (if enabled)
- [ ] Log out
- [ ] Log in with test account

### 3. AI Chat
- [ ] Send test message: "Hello, Aether!"
- [ ] Verify AI responds
- [ ] Check response quality
- [ ] Verify token usage displayed

### 4. File Upload (If Enabled)
- [ ] Visit `/avatar/upload`
- [ ] Upload test image
- [ ] Verify upload success
- [ ] Check file is accessible

### 5. Metrics
- [ ] Visit `/api/metrics` (while logged in)
- [ ] Verify user stats displayed
- [ ] Check blockchain data (if Hedera enabled)

---

## 🔒 Security Verification

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers present (check /api/health response)
- [ ] Rate limiting working (send 10+ rapid requests)
- [ ] API endpoints require auth where needed
- [ ] No environment variables exposed in browser

---

## 🌐 Custom Domain (Optional)

- [ ] Vercel → Settings → Domains
- [ ] Add domain (e.g., `www.itsaether.ai`)
- [ ] Follow DNS configuration instructions
- [ ] Update `NEXTAUTH_URL` to new domain
- [ ] Redeploy
- [ ] Wait for DNS propagation (5-10 min)
- [ ] Test with new domain

---

## 📊 Monitoring Setup

- [ ] Set up external uptime monitoring
  - Recommended: [UptimeRobot](https://uptimerobot.com)
  - Monitor: `https://your-domain.com/api/health`
- [ ] Enable Vercel Speed Insights (already enabled)
- [ ] Review Vercel Analytics dashboard
- [ ] Set up error alerts (Vercel or Sentry)

---

## 📱 Mobile Testing

- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on tablet
- [ ] Verify responsive design
- [ ] Check touch interactions

---

## 📝 Documentation

- [ ] Update README with deployment URL
- [ ] Document custom domain (if applicable)
- [ ] Note any deployment-specific configuration
- [ ] Share access with team members
- [ ] Document monitoring setup

---

## 🎯 Performance

- [ ] Check Speed Insights in Vercel dashboard
- [ ] Verify page load < 3 seconds
- [ ] Check Core Web Vitals
- [ ] Test API response times
- [ ] Verify database query performance

---

## 🔄 Continuous Deployment

- [ ] Verify auto-deploy on push to main
- [ ] Test by pushing a small change
- [ ] Verify preview deployments on PRs
- [ ] Set up branch protection rules (optional)

---

## ✅ Final Verification

- [ ] All services healthy
- [ ] No errors in Vercel logs
- [ ] Database queries working
- [ ] AI chat functioning
- [ ] Authentication working
- [ ] File uploads working (if enabled)
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment

---

## 🚨 Rollback Plan

If something goes wrong:

1. [ ] Go to Vercel → Deployments
2. [ ] Find last working deployment
3. [ ] Click "..." → "Promote to Production"
4. [ ] Verify rollback successful
5. [ ] Investigate issue before redeploying

---

## 📞 Emergency Contacts

- **Vercel Status:** [vercel-status.com](https://www.vercel-status.com)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **GitHub Issues:** [github.com/d8hd5ys68s-arch/ItsAetherAI/issues](https://github.com/d8hd5ys68s-arch/ItsAetherAI/issues)

---

## 🎉 Deployment Complete!

**Production URL:** `https://your-project.vercel.app`

**Quick Links:**
- Health: `/api/health`
- Metrics: `/api/metrics`
- Dashboard: [Vercel Dashboard](https://vercel.com/dashboard)

---

**Deployed:** ___________________
**Deployed By:** ___________________
**Production URL:** ___________________
**Custom Domain:** ___________________

---

Print this checklist or save it for reference during your next deployment!
