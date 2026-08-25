# Build & Builder Instructions — NO GUESSING

**Repository purpose: Migration**

## NON-NEGOTIABLE

**NEVER GUESS.** This repository is a migration/reference source. Never assume that code here is canonical, obsolete, complete, or safe to copy without verification.

Do not infer repository purpose, architecture, ownership, dependencies, deployment targets, data sources, credentials, API contracts, feature status, or prior decisions from filenames, assumptions, memory fragments, or stale documentation.

## Evidence hierarchy

1. Explicit current project architecture/decision records.
2. Verified source code, schemas, configuration, deployment configuration, and tests.
3. Current repository/build-agent instructions.
4. Current connected platform state.
5. Historical documentation.
6. Never use unsupported inference as a fact.

If sources conflict, identify the conflict and verify the authoritative source before migrating anything.

## Existing knowledge must be preserved

Do not repeatedly rediscover or overwrite established project knowledge. Treat the capability registry and migration manifest as persistent state. When evidence changes a migration decision, update the authoritative record rather than silently replacing it.

## Before every migration/build

1. Identify the exact capability.
2. Verify what the source implementation actually does.
3. Verify whether an equivalent exists in a canonical repository.
4. Determine the canonical destination from the current product architecture.
5. Identify dependencies, contracts, schemas, permissions, environment variables, and deployment relationships.
6. Determine whether the source capability is unique, duplicate, superseded, incomplete, broken, or unknown.
7. Only then migrate or modify it.

## Cross-repository rule

All Interplanetary Fund repositories are components of **one cohesive product**. Never create a competing production source of truth. Preserve stable business/entity IDs and canonical backend ownership.

## Unknowns

If something cannot be verified, mark it **UNKNOWN**. Do not fill the gap with an assumption. Ask only when available evidence cannot resolve a material decision.

## Completion rule

Never mark a migration complete because files were copied. Verify behavior, dependencies, contracts, permissions, deployment configuration, and end-to-end operation at the destination.
