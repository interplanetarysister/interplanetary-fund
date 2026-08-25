# Build & Builder Instructions — NO GUESSING

**Repository purpose: Base44**

## NON-NEGOTIABLE

**NEVER GUESS.** Verify facts from the actual Base44 project configuration, source, backend behavior, deployment state, or authoritative Interplanetary Fund product records before making changes.

Do not infer architecture, ownership, dependencies, deployment targets, data sources, credentials, API contracts, feature status, or migration status from filenames, assumptions, memory fragments, or stale documentation.

## Evidence hierarchy

1. Explicit current Interplanetary Fund architecture/decision records.
2. Verified Base44 source, configuration, entities/functions, and tests.
3. Current build-agent instructions.
4. Current Base44/backend platform state.
5. Historical documentation.
6. Never use unsupported inference as a fact.

If sources conflict, stop and verify the authoritative source. Do not silently choose one.

## Existing knowledge must be preserved

Do not repeatedly rediscover or overwrite established product knowledge. Treat the current capability registry and migration decisions as persistent state. If new evidence changes a decision, update the authoritative record.

## Before every Base44 build

1. Identify the exact capability being changed.
2. Verify its current implementation and runtime behavior.
3. Determine whether the capability has a canonical implementation in `InterplanetaryFund` or `interplanetary-fund-backend`.
4. Determine whether this Base44 implementation is active production functionality, migration material, or compatibility infrastructure.
5. Verify backend/data ownership and contracts.
6. Check authentication, permissions, environment configuration, and deployment relationships.
7. Only then implement.

## One-product rule

Base44 is part of the **single cohesive Interplanetary Fund product**, not a separate product. Shared live entities must retain their canonical identity and source of truth. Never create a competing production campaign database or silently fork business logic.

## Migration rule

When consolidating Base44 functionality, preserve stable IDs and behavior, identify unique capabilities, migrate them to the correct canonical destination, and retain the Base44 implementation until equivalent production behavior is verified.

## Unknowns

If a fact cannot be verified, mark it **UNKNOWN**. Do not guess. Escalate only material decisions that cannot be resolved from available evidence.

## Completion rule

Never report a build as complete merely because files changed. Verify the affected Base44 runtime/publishing behavior and the end-to-end product flow.
