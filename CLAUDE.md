# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Aether AI** is an enterprise-grade AI platform built with Next.js 15, featuring:
- Real AI chat powered by Google Gemini 2.0 Flash
- Blockchain-based API call tracking via Hedera Hashgraph
- Full-stack authentication with NextAuth.js
- PostgreSQL database (Vercel Postgres)
- Modern glassmorphic UI with Tailwind CSS

This is a **production-ready full-stack application** deployed on Vercel with complete backend infrastructure.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **React**: Version 19 with TypeScript
- **Styling**: Tailwind CSS 4 (with custom theme variables)
- **UI Components**: Shadcn/ui (New York style) + GitHub Spark components
- **Icons**: Phosphor Icons (primary), Lucide Icons (secondary via shadcn)
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast library)
- **Charts**: Recharts (for data visualization)

### Backend
- **Runtime**: Next.js API Routes (serverless functions)
- **Database**: Vercel Postgres (PostgreSQL)
- **Authentication**: NextAuth.js v5 with credentials provider
- **AI**: Google Gemini 2.0 Flash via @google/generative-ai
- **Blockchain**: Hedera Hashgraph SDK (@hashgraph/sdk)
- **Password Hashing**: bcryptjs

## Development Commands

```bash
# Start development server on port 9002
npm run dev

# Build for production
npm run build

# Start production server on port 9002
npm run start

# Type check without building
npm run typecheck

# Lint the codebase
npm run lint

# Deploy to Vercel
vercel deploy

# Deploy to production
vercel --prod
```

## Project Structure

```
app/
├── layout.tsx                    # Root layout with fonts and error boundary
├── page.tsx                      # Home page (client component)
├── api/                          # API Routes (serverless functions)
│   ├── auth/[...nextauth]/       # NextAuth.js authentication
│   │   └── route.ts
│   ├── chat/                     # AI chat endpoint
│   │   └── route.ts
│   └── hedera/                   # Hedera blockchain endpoints
│       ├── transactions/
│       │   └── route.ts
│       └── setup/
│           └── route.ts

lib/
├── ai/
│   └── gemini.ts                 # Google Gemini AI integration
├── auth/
│   └── config.ts                 # NextAuth.js configuration
├── db/
│   ├── schema.sql                # PostgreSQL database schema
│   └── index.ts                  # Database utilities and queries
├── hedera/
│   └── client.ts                 # Hedera Hashgraph client and utilities

src/
├── ErrorFallback.tsx             # Global error boundary fallback UI
├── components/
│   ├── AnimatedBackground.tsx    # SVG blob animations and particle effects
│   ├── Navigation.tsx            # Top nav with scroll effects
│   ├── HeroSection.tsx           # Hero with animated stats
│   ├── FeaturesSection.tsx       # Grid of feature cards with 3D tilt
│   ├── AIDemoSection.tsx         # Interactive AI chat interface (now with real AI)
│   ├── TechnologySection.tsx     # Technology stack showcase
│   ├── BetaSection.tsx           # Email signup form
│   ├── Footer.tsx                # Footer with links
│   ├── ScrollToTop.tsx           # Scroll-to-top button
│   ├── ScrollIndicator.tsx       # Progress bar at top of page
│   ├── AuthModal.tsx             # Login/Register modal with NextAuth
│   ├── LoadingShimmer.tsx        # Skeleton loading component
│   └── ui/                       # Shadcn UI component library (50+ components)
├── hooks/
│   └── use-mobile.ts             # Mobile viewport detection hook
└── styles/
    └── theme.css                 # Custom CSS theme variables
```

## Architecture & Design Patterns

### Full-Stack Architecture
- **Frontend**: Next.js App Router with client components ('use client')
- **Backend**: Next.js API Routes as serverless functions
- **Database**: Vercel Postgres with SQL queries via @vercel/postgres
- **Authentication**: NextAuth.js v5 with JWT sessions
- **AI Layer**: Google Gemini 2.0 Flash with custom system prompts
- **Blockchain**: Hedera Consensus Service for immutable API call logging

### Component Composition
- **Page-based routing**: Next.js App Router handles navigation
- **Client components**: All UI components marked with 'use client'
- **Section-based architecture**: Each major feature is a self-contained section component
- **Controlled components**: Forms use controlled inputs with React Hook Form
- **Compound components**: UI library uses Radix UI primitives with custom styling

### State Management
- **Server-side**: NextAuth session, database queries in API routes
- **Client-side**: Local state via useState, no global state management
- **Form state**: React Hook Form handles form state and validation
- **Auth state**: NextAuth useSession hook for client-side session access
- **Chat state**: Stored in PostgreSQL database, fetched via API routes

### Styling System
- **Theme variables**: Custom CSS properties defined in theme.css for colors, spacing, radii
- **Tailwind configuration**: Extended with custom Radix color scales and Spark design tokens
- **Color system**: Uses OKLCH color space for advanced color definitions
- **Responsive design**: Mobile-first with breakpoint-specific utilities
- **Glassmorphism**: backdrop-filter effects with translucent backgrounds
- **Custom spacing**: 8px base unit system via CSS variables (--size-*)

### Animation Patterns
- **Background animations**: SVG morphing blobs with CSS animations
- **Scroll animations**: Intersection Observer for fade-in effects (inferred from design requirements)
- **Hover interactions**: 3D tilt transforms on cards, glow effects on buttons
- **Loading states**: Skeleton screens and shimmer effects
- **Toast notifications**: Positioned top-right with custom glassmorphic styling

## Backend Services

### Database Layer (`lib/db/index.ts`)
- **PostgreSQL via @vercel/postgres**: Direct SQL queries using template literals
- **Type-safe**: TypeScript interfaces for all database models
- **Methods**:
  - `upsertUser()` - Create or update user accounts
  - `getUserById()`, `getUserByEmail()` - User retrieval
  - `checkRateLimit()` - Rate limiting logic
  - `saveChatMessage()`, `getChatMessages()` - Chat persistence
  - `saveHederaTransaction()`, `getHederaTransactions()` - Blockchain records

### Authentication (`lib/auth/config.ts`)
- **NextAuth.js v5** with credentials provider
- **Sign up flow**: Email/password → bcrypt hash → UUID generation → DB insert
- **Sign in flow**: Email lookup → password verify → JWT creation
- **Session**: JWT-based (not database sessions)
- **Callbacks**: Custom JWT and session callbacks to include user ID

### AI Service (`lib/ai/gemini.ts`)
- **Model**: Gemini 2.0 Flash (gemini-2.0-flash-exp)
- **Custom system prompt**: Defines Aether AI personality and capabilities
- **Features**:
  - Chat history support
  - Token usage estimation
  - Cost calculation (per 1M tokens)
  - Streaming support (for future implementation)
  - Safety settings configured

### Hedera Service (`lib/hedera/client.ts`)
- **Network**: Testnet (configurable to mainnet)
- **Features**:
  - Topic creation for consensus service
  - Message submission to topics
  - API call tracking with metadata
  - Transaction receipt retrieval
  - Mirror node querying for transaction history
- **Privacy**: Query content is hashed, not stored on-chain

## Key Implementation Details

### API Route: Chat (`app/api/chat/route.ts`)
- **POST**: Send a chat message
  1. Get user session (or use 'anonymous')
  2. Check rate limit (100 requests per 15min)
  3. Generate AI response via Gemini
  4. Track API call on Hedera (optional)
  5. Save messages to database
  6. Return response with cost/token data
- **GET**: Retrieve chat history for authenticated user

### API Route: Hedera Transactions (`app/api/hedera/transactions/route.ts`)
- **GET**: Retrieve user's Hedera transaction history
- Includes transaction summary (total cost, carbon saved)
- Can query specific transaction by ID

### API Route: Hedera Setup (`app/api/hedera/setup/route.ts`)
- **POST**: Create a new Hedera topic for API tracking (one-time setup)
- **GET**: Check Hedera configuration status

### Authentication Modal (AuthModal.tsx)
- **Form modes**: Toggle between login and register
- **Integration**: Calls NextAuth signIn() with credentials
- **Validation**: Real-time form validation via React Hook Form
- **Error handling**: Displays authentication errors to user

### Theme System
- Uses GitHub Spark's theme variable system
- Supports dark mode via `[data-appearance="dark"]` selector
- Radix Colors integration for accessible color scales
- Custom gradient definitions for purple-blue-cyan triadic scheme

### Responsive Behavior
- **Mobile breakpoints**: Uses Tailwind's default + custom pointer and PWA media queries
- **Navigation**: Collapses to hamburger menu on mobile (inferred)
- **Cards**: Stack vertically on small screens
- **Typography**: Scales down (Hero: 96px → 48px mobile)
- **Performance**: Reduced particle effects and blur on mobile

## Common Development Patterns

### Adding New UI Components
```bash
# Shadcn components are pre-installed, to add more:
npx shadcn@latest add [component-name]
```

Components are configured to use:
- Style: "new-york"
- Path alias: @/components/ui
- CSS variables for theming
- Lucide icons

### Creating New Sections
1. Create component in `src/components/[SectionName].tsx`
2. Import and add to `App.tsx` in desired order
3. Follow glassmorphic design pattern:
   - Semi-transparent backgrounds
   - Backdrop blur effects
   - Subtle borders with white/translucent colors
   - Gradient accents for CTAs

### Working with Animations
- Use Framer Motion for complex animations
- Use CSS transitions for simple hover effects
- Follow physics-based easing curves
- Keep animations purposeful and performant
- Reduce motion on mobile devices

### Color Usage Guidelines
- **Primary actions**: Deep purple (oklch(0.62 0.24 295))
- **Secondary elements**: Vibrant blue (oklch(0.60 0.22 250))
- **Accents/CTAs**: Cyan (oklch(0.75 0.16 195))
- **Backgrounds**: Deep black (oklch(0.10 0 0))
- **Text**: Light gray (oklch(0.90 0 0)) to white
- **Always use CSS variables** from theme.css when possible

## Important Constraints & Gotchas

### Environment Variables
- **REQUIRED for development**:
  - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
  - `NEXTAUTH_URL` - http://localhost:9002 for local dev
  - `GOOGLE_GENAI_API_KEY` - Get from Google AI Studio

- **REQUIRED for Vercel deployment**:
  - All of the above
  - `POSTGRES_URL` and related vars (auto-injected by Vercel)

- **Optional**:
  - Hedera variables (HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, HEDERA_TOPIC_ID)
  - If not set, app works but without blockchain tracking

### Database Setup
- **Must run schema.sql** before first use
- Tables: `users`, `chat_messages`, `hedera_transactions`
- Vercel Postgres: Run schema in the Vercel dashboard Query tab
- Local dev: Can use Vercel CLI (`vercel env pull`) or local Postgres

### Path Aliases
- `@/` maps to project root directory (not just src/)
- Configured in tsconfig.json paths
- Used for imports: `@/lib/`, `@/app/`, `@/src/`

### NextAuth.js V5
- Uses beta version (5.0.0-beta.25)
- API is different from v4 - check documentation
- JWT sessions (not database sessions)
- Session available in API routes via `getServerSession(authConfig)`

### GitHub Spark Integration
- Spark components work in Next.js
- '@github/spark' imports still functional
- Some Spark features may need 'use client' directive

### Vercel Deployment
- Postgres database must be created in Vercel dashboard
- Environment variables set in project settings
- Automatic deployments on git push
- Edge runtime not compatible with Hedera SDK (use Node.js runtime)

## Testing & Quality

### Current State
- No test files present in the repository
- No testing framework configured
- Error boundary provides basic error handling
- Sentry mentioned in README but not implemented

### To Add Tests
Would need to install and configure:
- Vitest (Vite-native test runner)
- React Testing Library
- Mock service worker for API mocking

## Design Philosophy

From PRD.md, the design should be:
- **Futuristic**: Quantum computing aesthetic with glassmorphism
- **Sophisticated**: Premium typography (Space Mono + Inter), refined interactions
- **Interactive**: Real-time feedback, smooth transitions, micro-interactions
- **Performant**: Optimized animations, reduced effects on mobile
- **Accessible**: Keyboard navigation, ARIA labels, reduced motion support

### Visual Identity
- Triadic color scheme (purple, blue, cyan)
- Glassmorphic Apple aesthetics meets cyberpunk
- Physics-based animations with purposeful meaning
- Monospace headings (Space Mono) for technical feel
- Geometric body text (Inter) for readability

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add Vercel Postgres database
4. Run schema.sql in Postgres Query tab
5. Set environment variables
6. Deploy

See **SETUP.md** for detailed deployment instructions.

### Environment Variables Checklist
- [ ] `NEXTAUTH_URL` - Your deployment URL
- [ ] `NEXTAUTH_SECRET` - Random 32-character string
- [ ] `GOOGLE_GENAI_API_KEY` - From Google AI Studio
- [ ] `POSTGRES_URL` - Auto-injected by Vercel
- [ ] `HEDERA_ACCOUNT_ID` - Optional
- [ ] `HEDERA_PRIVATE_KEY` - Optional
- [ ] `HEDERA_TOPIC_ID` - Optional (create via /api/hedera/setup)

### Database Initialization
Run this in Vercel Postgres Query tab:
```sql
-- Copy contents of lib/db/schema.sql
```

## Additional Resources

- **SETUP.md**: Complete deployment guide
- **PRD.md**: Product requirements and design specifications
- **README.md**: Project overview and architecture
- **lib/db/schema.sql**: Database schema
- **Next.js docs**: https://nextjs.org/docs
- **NextAuth.js v5 docs**: https://authjs.dev
- **Vercel Postgres docs**: https://vercel.com/docs/storage/vercel-postgres
- **Google Gemini API docs**: https://ai.google.dev/docs
- **Hedera docs**: https://docs.hedera.com
- **Shadcn UI docs**: https://ui.shadcn.com
- **Tailwind CSS v4 docs**: https://tailwindcss.com

## Quick Reference

### API Endpoints
- `POST /api/chat` - Send chat message (requires body: { message, chatHistory? })
- `GET /api/chat` - Get chat history (authenticated)
- `GET /api/hedera/transactions` - Get Hedera transactions (authenticated)
- `POST /api/hedera/setup` - Create Hedera topic (one-time)
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Database Tables
- `users(id, user_id, email, password_hash, display_name, created_at, api_call_count, rate_limit_reset)`
- `chat_messages(id, user_id, role, content, model, tokens_used, cost, hedera_transaction_id, created_at)`
- `hedera_transactions(id, user_id, transaction_id, consensus_timestamp, status, cost, carbon_impact, api_call_type, metadata, created_at)`

### Common Tasks

**Add a new API route:**
```typescript
// app/api/myroute/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' });
}
```

**Query the database:**
```typescript
import { Database } from '@/lib/db';

const messages = await Database.getChatMessages(userId, 50);
```

**Get user session in API route:**
```typescript
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/config';

const session = await getServerSession(authConfig);
const userId = session?.user?.id;
```
