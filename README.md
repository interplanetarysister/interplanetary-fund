# Interplanetary Fund — Credit-Free Backend

Independent backend for the Interplanetary Fund platform. Built on Convex — runs entirely outside Base44's credit system.

## What This Is

This is the agent infrastructure, protocol enforcement, and treasury management system for the Interplanetary Fund. It was designed by Lyra (Chief of Staff for Agents) under directive from Michelle Rogers to operate with **zero recurring credits** on any platform.

## Architecture

```
interplanetary-fund-backend/
├── convex/
│   ├── schema.ts        — 8 tables: agents, campaigns, reports, platforms, holding accounts, payouts, transactions, fees
│   ├── protocol.ts      — Protocol enforcement (P-1 through P-8) + weekly training + reports
│   ├── treasury.ts     — Fee calculation, deposits, payouts, batch payouts, balance aggregation
│   ├── agents.ts        — Agent CRUD, memory updates, task tracking, campaign assignment
│   ├── campaigns.ts     — Campaign sync, external platform connections, live balance dashboard
│   └── crons.ts         — Scheduled jobs (daily 6am audit, weekly Saturday 2am training)
├── package.json
├── tsconfig.json
└── README.md
```

## Tables

| Table | Purpose |
|-------|---------|
| `agents` | 7 agent profiles with memory, scores, capabilities, managed campaigns |
| `monitoredCampaigns` | Mirror of Interplanetary Fund campaign data for credit-free auditing |
| `protocolReports` | Persistent audit history with compliance scores and violations |
| `externalPlatforms` | Connected external crowdfunding accounts (GoFundMe, Kickstarter, etc.) |
| `holdingAccounts` | User fund balances (gross display, fee tracking) |
| `payoutRequests` | Cashout requests with fee breakdown and payout method |
| `transactions` | All fund movements (deposits, payouts, fees) |
| `feeConfig` | Platform fee configuration (defaults: 5% platform, 2.9% + $0.30 processing) |

## Agents

| # | Agent | Role | Purpose |
|---|-------|------|---------|
| 1 | Fundraising Agent | fundraising | Campaign optimization, donor outreach, revenue maximization |
| 2 | Story Agent | story | AI campaign story generation, optimization, A/B testing |
| 3 | Donor Relations Agent | donor_relations | Donor engagement, retention, thank-you automation |
| 4 | Protocol Agent | protocol | Campaign compliance monitoring, protocol enforcement |
| 5 | Analytics Agent | analytics | Revenue tracking, donor analytics, performance reporting |
| 6 | Treasury Agent | treasury | Holding accounts, fee calculation, payout processing |
| 7 | Platform Sync Agent | platform_sync | External platform connections, live data sync |

## Protocol Standards

| ID | Standard | Status |
|----|----------|--------|
| P-1 | Outreach enabled on ALL campaigns | ✅ Enforced |
| P-2 | AI profile complete (tone, donors, orgs, platforms) | ⚠️ Flagged |
| P-3 | Story present with SEO + accessibility | ✅ Enforced |
| P-4 | Payment path functional on active campaigns | ❌ Critical blocker |
| P-5 | Required fields complete | ⚠️ Flagged |
| P-6 | Agent assigned to each campaign | ✅ 7 agents active |
| P-7 | External platform sync | ⏳ Pending Builder AI |
| P-8 | Fund migration & holding account | ⏳ Fee logic ready |

## Fee Model

```
Available Balance: $5,000.00  (gross — what user sees)
You Will Receive:  $4,605.00  (net — shown on cashout)
Our Fee:           $395.00   (5% platform + 2.9% + $0.30 processing)
```

Fees are calculated at **payout time**, not at deposit time. Users see their gross balance until they cash out.

## Getting Started

```bash
# Install dependencies
npm install

# Set up Convex (requires Convex account)
npx convex dev

# Deploy to production
npx convex deploy

# View dashboard
npx convex dashboard
```

## Credits

- **Convex:** Free tier covers development. Paid plan for production scale.
- **Base44:** Zero recurring credits. Builder AI only contacted for UI/architecture changes (rare, manual).
- **LLM:** Zero recurring credits. All enforcement runs as code.

## Authority

- **Designed by:** Lyra, Chief of Staff for Agents
- **Directive from:** Michelle Rogers, Executive AI Program Director
- **Established:** August 1, 2026
- **License:** MIT
