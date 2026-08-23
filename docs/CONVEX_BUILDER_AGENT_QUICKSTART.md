# CONVEX BUILDER AGENTS — QUICKSTART

**For the persistent Convex Builder Agents working on Interplanetary Fund.**

Before doing project work, every agent must read:

1. `docs/CONVEX_BUILDER_AGENT_FLOW.md` — authoritative workflow map
2. `convex/developmentAgentInstructions.ts` — runtime instructions
3. Relevant repository instructions, issue, PR and review context

## The three Convex Builder Agents

- **Convex Builder Agent 1 — Primary Builder:** implements ready work end-to-end and requests review.
- **Convex Builder Agent 2 — Builder/Reviewer:** reviews, builds and corrects incomplete or bad implementations.
- **Convex Builder Agent 3 — Auditor/Verifier Builder:** independently verifies and remediates defects, security issues and regressions.

## Non-negotiable loop

**Build → Review → Verify → PASS → Complete**

If verification fails:

**FAIL → Rework → Investigate → Correct → Test → Verify Again**

A failed verification stays unresolved. Do not close it merely because a report was written.

## Non-overlap rule

Check what the other Convex Builder Agents are doing before editing. Coordinate ownership through GitHub. Do not create competing implementations or overwrite another agent's active work.

## Review rule

A requested review is a required work item. Never ignore it. Required review findings must be resolved and verified before completion.

## Evidence rule

Never claim work was built, tested, reviewed, fixed or verified without actual evidence.
