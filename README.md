# ✨🌟 Interplanetary Fund — ARCHIVAL / MIGRATION REFERENCE 🌟✨

> **✨ ARCHIVAL CANDIDATE — DO NOT USE AS A NEW PRODUCTION SOURCE OF TRUTH. ✨**
>
> Unique production-relevant capabilities must be reconciled into the canonical repositories before this repository is finally archived.

**Purpose: Migration**

Historical/reference repository for the single Interplanetary Fund product. It is retained for capability recovery and migration auditing, not as an independent production product.

## Product Build Contract

Interplanetary Fund is **one cohesive product implemented across coordinated repositories**. Repositories are implementation boundaries, not separate products.

### Repository purposes

| Repository | Purpose | Authority |
|---|---|---|
| `interplanetarysister/InterplanetaryFund` | **Frontend** | User-facing React/Vite application |
| `interplanetarysister/interplanetary-fund-backend` | **Backend** | Backend, admin, agents, security, treasury, operations |
| `interplanetarysister/interplanetary-fund` | **Migration** | Historical/reference source until every unique capability is reconciled |

### Build-agent rule

Every build agent, workflow, Copilot/Codex task, and human implementation must treat the three repositories as **one product**. Before changing code, identify the repository purpose and determine whether the capability is frontend-only, backend/operations-only, or cross-repository.

For cross-repository work, compare this repository's historical implementation against the canonical repositories and migrate unique production-relevant capability to its proper canonical destination. Do not introduce competing production sources of truth.

Live campaigns, users, donations, permissions, agent state, administrative state, and other business entities must retain one canonical live identity in the authoritative backend.

### Migration destinations

- User-facing React/Vite functionality → `interplanetarysister/InterplanetaryFund` (**Frontend**)
- Backend, Convex, admin, agents, security, treasury, and operations → `interplanetarysister/interplanetary-fund-backend` (**Backend**)
- Historical/reference material remains here only until capability-by-capability reconciliation is complete.

### Migration safety rules

- Preserve stable business/entity IDs and contracts.
- Do not copy secrets or credentials into source control.
- Do not create a second production database or competing campaign store.
- Compare behavior before migrating functionality.
- Verify imports, schemas, APIs, permissions, environment variables, and deployment configuration after migration.
- Do not delete or archive this repository until all unique production-relevant capabilities are migrated or intentionally retired.

## Build Commands

```bash
npm install
npm run dev
npm run build
```

See `MIGRATION_MANIFEST.md` and `PRODUCT_SYSTEM_CONTRACT.md` for the authoritative migration and product rules.
