# Branch Governance

Interplanetary Fund uses `main` as the production source of truth.

## Integration rules

1. Compare every candidate branch against current `main` before integration.
2. Never merge a stale branch wholesale when it is behind `main`.
3. When a branch contains useful work but has diverged, create a fresh branch from current `main` and port only the reviewed change.
4. Do not merge legacy, duplicate, temporary, or verification branches into production.
5. Preserve the canonical React + Vite, Convex, Vercel, and Capacitor architecture.
6. Payment, treasury, authentication, and persistent-agent orchestration changes require explicit review before production integration.
7. Temporary verification branches must be reset/removed after verification.

## 2026-08-25 audit disposition

`main` remains canonical. The persistent-agent-orchestration change is already represented in current production `convex/crons.ts`; the old feature branch is stale and must not be merged wholesale.
