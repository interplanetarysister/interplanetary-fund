# Trigger Base44 Consolidation

This marker intentionally lives at the repository root on `main` so the `Consolidate Base44 Product Source` GitHub Actions workflow can find it.

The workflow imports the current `interplanetaryfund-base44` source into `base44-source/` for capability-by-capability reconciliation while preserving the existing canonical React/Vite frontend and Convex backend architecture.

Do not delete this marker manually; the workflow removes it after a successful consolidation commit.