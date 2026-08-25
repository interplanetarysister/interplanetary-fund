# Interplanetary Fund — Migration Manifest

**Effective:** 2026-08-25

This repository is a migration/reference source for the single Interplanetary Fund product. It is not an independent production product.

## Destination map

| Source capability | Canonical destination |
|---|---|
| User-facing React/Vite pages and components | `interplanetarysister/InterplanetaryFund` |
| Shared frontend styling/assets | `interplanetarysister/InterplanetaryFund` |
| Campaign user flows | `interplanetarysister/InterplanetaryFund` + shared backend contract |
| Convex/backend functions | `interplanetarysister/interplanetary-fund-backend` |
| Admin cockpit and monitoring | `interplanetarysister/interplanetary-fund-backend` |
| Agent runtime/scheduling | `interplanetarysister/interplanetary-fund-backend` |
| Treasury/payment operations | `interplanetarysister/interplanetary-fund-backend` |
| Security/fraud/protocol enforcement | `interplanetarysister/interplanetary-fund-backend` |
| Scheduled jobs and operational integrations | `interplanetarysister/interplanetary-fund-backend` |
| Documentation describing the unified product contract | both canonical repositories |

## Migration rules

1. Compare capability before moving code.
2. Preserve stable business/entity IDs and backend contracts.
3. Do not create a second production database or competing campaign store.
4. Do not copy secrets or credentials into source control.
5. Move user-facing implementation to `InterplanetaryFund`.
6. Move backend/admin/agent/operations implementation to `interplanetary-fund-backend`.
7. Verify imports, environment variables, schemas, API contracts, permissions, and deployment configuration after each capability migration.
8. Retain this repository until every unique production-relevant capability is migrated or intentionally retired.
