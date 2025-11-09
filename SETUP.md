# Aether AI - Setup & Deployment Guide

This guide will walk you through setting up and deploying Aether AI on Vercel with Postgres database and Hedera integration.

## Prerequisites

- Node.js 18.17 or later
- Git
- GitHub account
- Vercel account (free tier available)
- Google AI API key ([Get one here](https://aistudio.google.com/app/apikey))
- Hedera account ([Create testnet account](https://portal.hedera.com/register))

## Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ItsAetherAI.git
cd ItsAetherAI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=your_random_secret_here

# Vercel Postgres (leave empty for now, will be filled by Vercel)
POSTGRES_URL=

# Google AI (Gemini) - REQUIRED for AI features
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here

# Hedera Configuration (Optional for local dev)
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=your_hedera_private_key
HEDERA_TOPIC_ID=0.0.xxxxx
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

---

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Add Vercel Postgres

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Choose a name (e.g., "aether-ai-db")
5. Select a region close to your users
6. Click "Create"

Vercel will automatically inject the following environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 4: Initialize Database Schema

1. Go to the Vercel Postgres dashboard
2. Click on "Query" tab
3. Copy the contents of `lib/db/schema.sql`
4. Paste and execute the SQL to create tables

Alternatively, you can run it locally with the Vercel CLI:

```bash
npm i -g vercel
vercel link
vercel env pull .env.local
# Then run the schema SQL using a postgres client
```

### Step 5: Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Required Variables

```env
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your_random_secret_here
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

#### Optional Hedera Variables

```env
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=your_hedera_private_key
HEDERA_TOPIC_ID=0.0.xxxxx
```

### Step 6: Set Up Hedera Topic (Optional)

If you want to enable Hedera blockchain tracking:

1. Create a Hedera testnet account at [portal.hedera.com](https://portal.hedera.com)
2. Note your Account ID and Private Key
3. Deploy the app without `HEDERA_TOPIC_ID` first
4. Once deployed, call the setup endpoint:

```bash
curl -X POST https://your-project.vercel.app/api/hedera/setup
```

5. Copy the returned Topic ID
6. Add `HEDERA_TOPIC_ID` to your Vercel environment variables
7. Redeploy

### Step 7: Redeploy

After adding all environment variables, trigger a new deployment:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

Or use the Vercel dashboard to redeploy.

---

## Configuration Options

### Authentication

The app uses NextAuth.js with credentials provider. Users can:
- Sign up with email and password
- Sign in with email and password
- Passwords are hashed with bcrypt

To add OAuth providers (Google, GitHub, etc.), edit `lib/auth/config.ts`.

### AI Model Configuration

Edit `lib/ai/gemini.ts` to configure:
- Model selection (default: `gemini-2.0-flash-exp`)
- Temperature, top-k, top-p parameters
- Safety settings
- Token limits

### Rate Limiting

Default rate limits (in `app/api/chat/route.ts`):
- 100 requests per 15 minutes per user
- Configurable via environment variables:

```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### Database Schema

Tables created:
- `users` - User accounts and authentication
- `chat_messages` - Chat history
- `hedera_transactions` - Blockchain transaction records

See `lib/db/schema.sql` for full schema.

---

## Testing the Deployment

### 1. Test Authentication

Visit your deployed URL and try:
- Creating an account
- Logging in
- Logging out

### 2. Test AI Chat

- Send a message in the AI demo section
- Check if responses are generated
- Verify rate limiting (send 100+ messages)

### 3. Test Hedera Integration (if configured)

- Send a chat message
- Check the browser console for transaction IDs
- Visit `/api/hedera/transactions?userId=YOUR_USER_ID`

### 4. Check Database

In Vercel Postgres dashboard:

```sql
-- Check users
SELECT * FROM users LIMIT 10;

-- Check chat messages
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;

-- Check Hedera transactions
SELECT * FROM hedera_transactions ORDER BY created_at DESC LIMIT 10;
```

---

## Troubleshooting

### Build Fails

- Check that all required environment variables are set
- Review build logs in Vercel dashboard
- Ensure `package.json` dependencies are correct

### Database Connection Errors

- Verify Postgres is provisioned in Vercel
- Check that environment variables are injected
- Ensure schema SQL has been executed

### Authentication Not Working

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your deployment URL
- Clear browser cookies and try again

### AI Responses Failing

- Verify `GOOGLE_GENAI_API_KEY` is valid
- Check API quota limits
- Review function logs in Vercel

### Hedera Transactions Failing

- Ensure `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY` are correct
- Verify `HEDERA_TOPIC_ID` exists
- Check Hedera testnet status

---

## Monitoring & Logs

### Vercel Dashboard

- View deployment logs
- Monitor function invocations
- Check error rates
- View analytics

### Database Monitoring

- View query performance in Postgres dashboard
- Monitor connection pool usage
- Check storage usage

---

## Cost Estimates

### Vercel (Free Tier)

- Serverless Function Executions: 100GB-Hrs/month
- Bandwidth: 100GB/month
- Build Time: 100 hours/month

### Vercel Postgres (Free Tier)

- 256 MB Storage
- 60 hours compute time/month
- Good for testing and small projects

### Google Gemini 2.0 Flash

- Free tier: 1,500 requests per day
- Paid: $0.075 per 1M input tokens, $0.30 per 1M output tokens

### Hedera Testnet

- **FREE** for testing
- Mainnet: ~$0.0001 USD per transaction

---

## Production Recommendations

### Security

1. Enable CORS restrictions
2. Add rate limiting middleware
3. Implement request validation
4. Use environment-specific secrets
5. Enable security headers (already configured)

### Performance

1. Upgrade Vercel plan for higher limits
2. Add CDN for static assets
3. Implement caching strategy
4. Optimize database queries with indexes

### Monitoring

1. Add Sentry for error tracking
2. Set up uptime monitoring
3. Configure alerts for failures
4. Monitor API costs

### Scaling

1. Upgrade Postgres plan as needed
2. Consider database connection pooling
3. Implement background jobs for heavy tasks
4. Use Edge Functions for global performance

---

## Support

- GitHub Issues: [Create an issue](https://github.com/YOUR_USERNAME/ItsAetherAI/issues)
- Vercel Support: [docs.vercel.com](https://vercel.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Hedera Docs: [docs.hedera.com](https://docs.hedera.com)

---

## Next Steps

1. Customize the frontend design
2. Add more AI features (image generation, code analysis, etc.)
3. Implement admin dashboard
4. Add analytics and usage tracking
5. Create API documentation
6. Set up automated testing
7. Implement CI/CD pipeline

Happy building! 🚀
