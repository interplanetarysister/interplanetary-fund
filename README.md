# Interplanetary Fund — Full-Stack Credit-Free App

Complete frontend + backend for the Interplanetary Fund platform. Runs entirely on Convex — zero Base44 credits.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Convex backend (creates local deployment + .env.local)
npx convex dev

# 3. In another terminal, seed the database
npx convex run seed:seedAll

# 4. Start the frontend
npm run dev
```

## Deploy to Convex Cloud

```bash
# 1. Login to Convex (opens browser)
npx convex login

# 2. Link to cloud project
npx convex dev

# 3. Deploy to production
npx convex deploy
```

## Architecture

```
interplanetary-fund-backend/
├── convex/                    # Backend (Convex functions)
│   ├── schema.ts             # 8 tables
│   ├── protocol.ts           # P-1 through P-8 enforcement
│   ├── treasury.ts           # Fee calculation, deposits, payouts
│   ├── agents.ts             # Agent CRUD and memory
│   ├── campaigns.ts          # Campaign sync + external platforms
│   ├── crons.ts              # Scheduled jobs (daily + weekly)
│   └── seed.ts               # One-click seed (7 agents + 4 campaigns)
├── src/                       # Frontend (React + Vite + Tailwind)
│   ├── main.tsx              # App entry with Convex provider
│   ├── App.tsx               # Shell with bottom navigation
│   ├── index.css             # Tailwind + custom styles
│   └── pages/
│       ├── Dashboard.tsx     # Revenue, campaigns, agents, audit overview
│       ├── Campaigns.tsx     # List with compliance badges + progress
│       ├── Agents.tsx        # 7 agent profiles with live memory
│       ├── Treasury.tsx      # Fee calculator, deposits, payouts
│       ├── Platforms.tsx     # External platform connections
│       └── Reports.tsx       # Protocol audit history
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Tables

| Table | Records | Purpose |
|-------|---------|---------|
| agents | 7 | Fundraising, Story, Donor Relations, Protocol, Analytics, Treasury, Platform Sync |
| monitoredCampaigns | 4 | Mirror of IF campaign data |
| protocolReports | auto | Audit history (created by weekly cron) |
| externalPlatforms | 0 | Connected GoFundMe/Kickstarter/Facebook accounts |
| holdingAccounts | 0 | User fund balances (gross display) |
| payoutRequests | 0 | Cashout requests with fee breakdown |
| transactions | 0 | All fund movements |
| feeConfig | 1 | Platform fee: 5%, Processing: 2.9% + $0.30 |

## Fee Model

```
Available Balance: $5,000.00  (gross — what user sees)
You Will Receive:  $4,604.70  (net — shown on cashout)
Our Fee:           $395.30   (5% platform + 2.9% + $0.30 processing)
```

## Scheduled Jobs

| Job | Schedule (UTC) | What it does |
|-----|---------------|--------------|
| daily-protocol-enforcement | 13:00 daily (6am PT) | Audit all campaigns against P-1 through P-8 |
| weekly-training-session | Sat 09:00 (2am PT) | Full audit + update agent memory + create report |

## Agents

| Agent | Role | Trust | Purpose |
|-------|------|-------|---------|
| Fundraising Agent | fundraising | 82 | Campaign optimization, donor outreach |
| Story Agent | story | 80 | AI story generation, optimization |
| Donor Relations Agent | donor_relations | 81 | Donor engagement, retention |
| Protocol Agent | protocol | 90 | Compliance monitoring, enforcement |
| Analytics Agent | analytics | 86 | Revenue tracking, reporting |
| Treasury Agent | treasury | 88 | Holding accounts, fee calculation, payouts |
| Platform Sync Agent | platform_sync | 84 | External platform connections, live sync |

## Credits

- **Convex:** Free tier for development. Paid plan for production.
- **Base44:** Zero recurring credits.
- **LLM:** Zero recurring credits. All enforcement runs as code.

## GitHub

Repo: `interplanetarysister/interplanetary-fund-backend` (private)
URL: https://github.com/interplanetarysister/interplanetary-fund-backend

## Authority

- **Designed by:** Lyra, Chief of Staff for Agents
- **Directive from:** Michelle Rogers, Executive AI Program Director
- **Established:** August 1, 2026
- **License:** MIT
