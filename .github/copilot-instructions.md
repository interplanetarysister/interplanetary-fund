# GitHub Copilot Instructions — Interplanetary Fund

## Project Overview
The Interplanetary Fund is a credit-free fundraising platform built with React + Convex + Base44. It manages crowdfunding campaigns, agent coordination, treasury operations, and protocol enforcement.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS (mobile-first, optimized for Galaxy A16)
- **Backend**: Convex (serverless functions, real-time WebSocket sync)
- **Mobile**: Capacitor wrapper for Android APK and iOS builds
- **Hosting**: Vercel (web), Base44 (APK production)
- **Source of Truth**: This GitHub repository
- **AI Coordination**: Lyra (Chief of Staff agent) manages 7 specialized agents as Convex records

## Convex Backend (convex/)
- `schema.ts` — 8 tables: agents, monitoredCampaigns, protocolReports, externalPlatforms, holdingAccounts, payoutRequests, transactions, feeConfig
- `agents.ts` — Agent CRUD, stats, memory updates, task outcomes
- `campaigns.ts` — Campaign sync, external platform connections, balance aggregation
- `treasury.ts` — Fee calculation, payout processing, batch operations
- `protocol.ts` — P-1 through P-8 enforcement, weekly training, auto-fix
- `crons.ts` — Daily 6am audit, weekly Saturday 2am training
- `seed.ts` — Initial data (7 agents, 4 campaigns)

## Convex URL
Production: `https://rosy-butterfly-2.convex.cloud`
REST API: `POST https://rosy-butterfly-2.convex.cloud/api/query` with `{"path": "moduleName:functionName", "args": {}}`

## Protocol Standards
- P-1: All campaigns must have outreach enabled
- P-2: All campaigns must have payment active
- P-3: All campaigns must have a story present
- P-4: All campaigns must have a cover image
- P-5: All campaigns must have a target audience defined
- P-6: Daily protocol audit enforced via cron
- P-7: Gross-to-net fee calculation for all deposits
- P-8: Batch payout processing with fee deduction

## Agents (7)
1. Fundraising Agent — campaign optimization, donor outreach
2. Story Agent — narrative optimization for campaigns
3. Donor Relations Agent — donor engagement and retention
4. Protocol Agent — compliance enforcement (P-1 through P-8)
5. Analytics Agent — revenue projection and performance metrics
6. Treasury Agent — fee calculation, payout management
7. Platform Sync Agent — external platform integration

## Key Conventions
- All currency values stored as floats (USD)
- Dates in ISO 8601 format
- Agent scores: trustScore, reliabilityScore, efficiencyScore, collaborationScore (0-100)
- Campaign status: "active" | "draft" | "completed" | "archived"
- Mobile-first: all UI must work on Galaxy A16 (360x800 viewport)

## Build Commands
- `npm run dev` — local development with Convex
- `npm run build` — production build to dist/
- `npm run preview` — preview production build
- `npx convex dev` — run Convex backend locally
- `npx convex deploy` — deploy Convex to production
- `npx cap sync` — sync web build to Capacitor
- `npx cap open android` — open Android Studio project
- `npx cap open ios` — open Xcode project (macOS only)

## Environment Variables
- `VITE_CONVEX_URL` — Convex deployment URL (in .env.local for dev, Vercel env vars for production)
