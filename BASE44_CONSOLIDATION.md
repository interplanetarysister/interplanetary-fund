# Base44 Consolidation

The `interplanetaryfund-base44` repository has been consolidated into this repository under `base44-source/` without discarding source files.

This is a source-preserving migration step. Files that duplicate current canonical implementations remain isolated under `base44-source/` until capability-by-capability reconciliation is completed. No secrets or Git metadata are intentionally imported.

Canonical product destinations remain:
- user-facing React/Vite implementation → `InterplanetaryFund`
- backend/admin/agents/treasury/operations → `interplanetary-fund-backend`
- this repository → migration/consolidation source
