# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Aether AI** is an enterprise-grade AI platform built with **Next.js 15**, featuring:
- Real AI chat powered by Google Gemini 2.0 Flash
- Blockchain-based API call tracking via Hedera Hashgraph
- Full-stack authentication with NextAuth.js v5
- PostgreSQL database (Vercel Postgres)
- Modern glassmorphic UI with Tailwind CSS 4

This is a **production-ready full-stack Next.js application** deployed on Vercel with complete backend infrastructure.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **React**: Version 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui (New York style, minimal set)
- **Icons**: Phosphor Icons (primary), Lucide Icons (secondary via shadcn)
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast library)
- **Error Handling**: react-error-boundary

### Backend
- **Runtime**: Next.js 15 API Routes (serverless functions)
- **Database**: Vercel Postgres (PostgreSQL)
- **Authentication**: NextAuth.js v5 (beta.25) with credentials provider
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
```

## Project Structure

```
/ (root)
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with fonts and error boundary
│   ├── page.tsx                  # Home page (client component with 'use client')
│   ├── globals.css               # Global styles (Tailwind + custom)
│   ├── theme.css                 # CSS theme variables
│   └── api/                      # API Routes (serverless functions)
│       ├── auth/[...nextauth]/
│       │   └── route.ts         # NextAuth.js authentication endpoint
│       ├── chat/
│       │   └── route.ts         # AI chat endpoint (Gemini API)
│       └── hedera/
│           ├── transactions/
│           │   └── route.ts
│           └── setup/
│               └── route.ts
│
├── components/                    # React components (all with 'use client')
│   ├── AnimatedBackground.tsx
│   ├── Navigation.tsx
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── AIDemoSection.tsx        # Interactive AI chat interface
│   ├── TechnologySection.tsx
│   ├── BetaSection.tsx
│   ├── Footer.tsx
│   ├── ScrollToTop.tsx
│   ├── ScrollIndicator.tsx
│   ├── AuthModal.tsx            # Login/Register modal
│   ├── LoadingShimmer.tsx
│   ├── ErrorFallback.tsx        # Error boundary UI
│   └── ui/                       # Shadcn UI components (minimal set)
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── alert.tsx
│
├── lib/                           # Shared backend utilities
│   ├── utils.ts                  # cn() utility for Tailwind
│   ├── ai/
│   │   └── gemini.ts             # Google Gemini AI integration
│   ├── auth/
│   │   └── config.ts             # NextAuth.js configuration + auth() helper
│   ├── db/
│   │   ├── schema.sql            # PostgreSQL database schema
│   │   └── index.ts              # Database utilities
│   └── hedera/
│       └── client.ts             # Hedera Hashgraph client
│
├── public/                        # Static assets
│
├── next.config.ts                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── vercel.json                    # Vercel deployment config
└── package.json                   # Dependencies and scripts
```

## Architecture & Design Patterns

### Full-Stack Next.js Architecture
- **Frontend**: Next.js App Router with client components ('use client' directive required)
- **Backend**: Next.js API Routes as serverless functions
- **Database**: Vercel Postgres with SQL queries via @vercel/postgres
- **Authentication**: NextAuth.js v5 with JWT sessions
- **AI Layer**: Google Gemini 2.0 Flash with custom system prompts
- **Blockchain**: Hedera Consensus Service for immutable API call logging

### Component Composition
- **Client Components**: All UI components require 'use client' directive
- **Section-based architecture**: Home page renders all section components sequentially
- **Controlled components**: Forms use controlled inputs with React Hook Form
- **Compound components**: UI library uses Radix UI primitives with custom styling

### State Management
- **Server-side**: NextAuth session, database queries in API routes
- **Client-side**: Local state via useState (no global state management)
- **Form state**: React Hook Form handles form state and validation
- **Auth state**: NextAuth `useSession()` hook for client-side session access
- **Chat state**: Stored in PostgreSQL database, fetched via API routes

### Styling System
- **Theme variables**: Custom CSS properties in `app/theme.css` + `app/globals.css`
- **Tailwind CSS 4**: Standard Tailwind with custom configuration
- **Color system**: Uses OKLCH color space for advanced color definitions
- **Responsive design**: Mobile-first with breakpoint-specific utilities
- **Glassmorphism**: backdrop-filter effects with translucent backgrounds

## Backend Services

### Database Layer (`lib/db/index.ts`)
- **PostgreSQL via @vercel/postgres**: Direct SQL queries using template literals
- **Type-safe**: TypeScript interfaces for all database models
- **Important**: Date objects must be converted to ISO strings for SQL queries
- **Methods**:
  - `upsertUser()` - Create or update user accounts
  - `getUserById()`, `getUserByEmail()` - User retrieval
  - `checkRateLimit()` - Rate limiting logic
  - `saveChatMessage()`, `getChatMessages()` - Chat persistence
  - `saveHederaTransaction()`, `getHederaTransactions()` - Blockchain records

### Authentication (`lib/auth/config.ts`)
- **NextAuth.js v5** (beta.25) with credentials provider
- **Exports**: `authConfig`, `handlers`, `auth`, `signIn`, `signOut`
- **Sign up flow**: Email/password → bcrypt hash → UUID generation → DB insert
- **Sign in flow**: Email lookup → password verify → JWT creation
- **Session**: JWT-based (not database sessions)
- **Usage in API routes**: `const session = await auth()`
- **Usage in API route handlers**: Export `{ GET, POST } = handlers`

### AI Service (`lib/ai/gemini.ts`)
- **Model**: Gemini 2.0 Flash (gemini-2.0-flash-exp)
- **Custom system prompt**: Defines Aether AI personality and capabilities
- **Features**: Chat history support, token usage estimation, cost calculation

### Hedera Service (`lib/hedera/client.ts`)
- **Network**: Testnet (configurable to mainnet)
- **Features**: Topic creation, message submission, API call tracking, transaction receipts
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

### NextAuth.js v5 Usage
```typescript
// In API routes
import { auth } from '@/lib/auth/config';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  // ...
}

// In auth route handler
import { handlers } from '@/lib/auth/config';
export const { GET, POST } = handlers;
```

## Common Development Patterns

### Adding New UI Components
```bash
# Shadcn components can be added (only add what you need):
npx shadcn@latest add [component-name]
```

Components are configured to use:
- Style: "new-york"
- Path: `components/ui/`
- CSS variables for theming
- Lucide icons

### Creating New Frontend Components
1. Create component in `components/[ComponentName].tsx`
2. **Add 'use client' directive** at the top
3. Import and add to `app/page.tsx`
4. Follow glassmorphic design pattern

**Example**:
```tsx
// components/NewSection.tsx
'use client';

import { useState } from 'react';

export function NewSection() {
  return (
    <section className="min-h-screen relative">
      {/* Your content */}
    </section>
  );
}

// app/page.tsx
import { NewSection } from '@/components/NewSection';
//... add <NewSection /> to the page
```

### Creating New API Routes
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export const runtime = 'nodejs'; // For Hedera SDK compatibility
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

## Important Constraints & Gotchas

### Environment Variables
**REQUIRED for development**:
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - http://localhost:9002 for local dev
- `GOOGLE_GENAI_API_KEY` - Get from Google AI Studio

**REQUIRED for Vercel deployment**:
- All of the above
- `POSTGRES_URL` and related vars (auto-injected by Vercel)

**Optional (Hedera Integration)**:
- `HEDERA_ACCOUNT_ID`, `HEDERA_PRIVATE_KEY`, `HEDERA_TOPIC_ID`

### Database Setup
- **Must run schema.sql** before first use
- Tables: `users`, `chat_messages`, `hedera_transactions`
- Vercel Postgres: Run schema in the Vercel dashboard Query tab
- **Date handling**: Convert Date objects to ISO strings for SQL queries

### Path Aliases
- `@/` maps to **project root directory**
- Common imports:
  - `@/components/Button` (frontend components)
  - `@/lib/db` (backend utilities)
  - `@/app/api/...` (rarely imported directly)

### Client Components
- **All interactive components MUST have 'use client' directive**
- **Avoid accessing `document` or `window` at module level**
- Use `useEffect` for browser APIs to avoid SSR errors

### Vercel Deployment
- Framework: Next.js (auto-detected)
- Build: Includes both frontend and API routes
- Database: Vercel Postgres (must be added in dashboard)
- Environment variables: Set in Vercel project settings
- Edge runtime: **Not compatible with Hedera SDK** (use `export const runtime = 'nodejs'`)

## Quick Reference

### API Endpoints
- `POST /api/chat` - Send chat message (body: `{ message, chatHistory? }`)
- `GET /api/chat` - Get chat history (authenticated)
- `GET /api/hedera/transactions` - Get Hedera transactions (authenticated)
- `POST /api/hedera/setup` - Create Hedera topic (one-time)
- `POST|GET /api/auth/[...nextauth]` - NextAuth endpoints

### Database Tables
- `users(id, user_id, email, password_hash, display_name, created_at, api_call_count, rate_limit_reset)`
- `chat_messages(id, user_id, role, content, model, tokens_used, cost, hedera_transaction_id, created_at)`
- `hedera_transactions(id, user_id, transaction_id, consensus_timestamp, status, cost, carbon_impact, api_call_type, metadata, created_at)`

### Common Tasks

**1. Add a new client component:**
```tsx
// components/MyComponent.tsx
'use client';

export function MyComponent() {
  return <div>Hello from Next.js!</div>;
}

// app/page.tsx
import { MyComponent } from '@/components/MyComponent';
// ... add <MyComponent /> to the page
```

**2. Query the database (in API route):**
```typescript
import { Database } from '@/lib/db';

const messages = await Database.getChatMessages(userId, 50);
```

**3. Get user session in API route:**
```typescript
import { auth } from '@/lib/auth/config';

const session = await auth();
const userId = session?.user?.id;
```

**4. Handle dates in SQL:**
```typescript
const date = new Date();
await sql`UPDATE users SET updated_at = ${date.toISOString()} WHERE id = ${id}`;
```

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

## Additional Resources

- **README.md**: Detailed project overview
- **lib/db/schema.sql**: Database schema
- **Next.js docs**: https://nextjs.org/docs
- **NextAuth.js v5 docs**: https://authjs.dev
- **Vercel Postgres docs**: https://vercel.com/docs/storage/vercel-postgres
- **Google Gemini API docs**: https://ai.google.dev/docs
- **Hedera docs**: https://docs.hedera.com
- **Shadcn UI docs**: https://ui.shadcn.com
- **Tailwind CSS docs**: https://tailwindcss.com
