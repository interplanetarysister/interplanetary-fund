# CONVEX BUILDER AGENT FLOW — Interplanetary Fund

**Authoritative workflow map for the persistent Convex Builder Agents (Agents 1, 2, and 3).**

> These are the three autonomous development agents orchestrated by Convex. They are **not** the application's internal fundraising/communications AI agents.
>
> GitHub is the persistent engineering workspace and communication record. Convex is the agent orchestration/runtime layer.

## 1. Agent roles

| Convex Builder Agent | Primary responsibility | Required behavior |
|---|---|---|
| **Convex Builder Agent 1 — Primary Builder** | Build and complete ready feature work | Implement end-to-end, test, request review, respond to findings |
| **Convex Builder Agent 2 — Builder/Reviewer** | Build, review and correct incomplete/bad work | Review Agent 1 and other work, reproduce defects, implement safe corrections, verify |
| **Convex Builder Agent 3 — Auditor/Verifier Builder** | Independent verification, audit and remediation | Test independently, find gaps/security/regressions, implement appropriate fixes, issue PASS/FAIL/BLOCKED |

All three are full implementation agents. They are not inspection-only agents.

## 2. Persistent operating cycle

```text
Convex Scheduler
      │
      ├── Agent 1: every 10 minutes
      ├── Agent 2: every 5 minutes
      └── Agent 3: every 15 minutes
      │
      ▼
Load latest Convex Builder Agent instructions
      │
      ▼
Inspect GitHub current state
(code + issues + PRs + reviews + handoffs + CI)
      │
      ▼
Check other agents' active ownership
      │
      ├── Work owned by another agent?
      │       ├── Yes → coordinate / review / unblock
      │       └── No  → claim and proceed
      │
      ▼
BUILD / REVIEW / AUDIT
      │
      ▼
Run appropriate tests and verification
      │
      ├──────────── PASS ────────────► Complete + document evidence
      │
      └──────────── FAIL
                    │
                    ▼
             REWORK REQUIRED
                    │
                    ▼
             Investigate finding
                    │
                    ▼
             Correct root cause
                    │
                    ▼
             Test / verify again
                    │
             ┌──────┴──────┐
             │             │
            PASS          FAIL
             │             │
             ▼             └──► Repeat rework loop
          COMPLETE
```

## 3. Coordination rules

Before changing anything, every Convex Builder Agent must:

1. Read the latest repository state.
2. Inspect open issues and linked PRs relevant to the work.
3. Check recent commits and active work from Agents 1, 2 and 3.
4. Check review requests and unresolved findings.
5. Establish ownership before touching overlapping files/features.

Agents must communicate through persistent GitHub artifacts. Every meaningful handoff records:

- owner
- repository
- issue/PR
- files or feature area
- current status
- remaining work
- dependencies/blockers
- tests/checks already run
- review status
- exact next action

If two agents discover the same task, they coordinate rather than creating competing implementations. One agent owns implementation; another reviews/tests unless a different split is explicitly documented.

No agent may overwrite, revert, or substantially alter another agent's active work without first understanding it and documenting the reason.

## 4. Review gate

Review requests are **mandatory work items**.

- Agent 1 requests review after implementation.
- Agent 2 reviews Agent 1 work when requested/ready and can implement corrections.
- Agent 3 independently verifies important/high-risk work and can remediate supported findings.
- No agent may ignore a requested review.
- No work is complete while required review findings remain unresolved.
- Review status must reflect evidence, not elapsed time.

## 5. Verification failure is a state, not a suggestion

A failed inspection/verification must never be treated as a completed finding.

Required state machine:

**BUILD → REVIEW → VERIFY → PASS → COMPLETE**

or

**BUILD → REVIEW → VERIFY → FAIL → REWORK → INVESTIGATE → CORRECT → TEST → VERIFY AGAIN**

On failure:

1. Preserve the original work as **REWORK / FAILED VERIFICATION**.
2. Record exact evidence, affected behavior/files and severity.
3. Notify the responsible implementing agent through GitHub.
4. The responsible agent returns to the failed area and investigates the actual finding.
5. Determine whether it is valid, misunderstood, or dependency-related.
6. Implement the correction when valid and within scope.
7. Run the relevant checks again.
8. Return through the review/verification gate.
9. Reviewer/verifier explicitly reports **PASS, FAIL, or BLOCKED**.
10. Only PASS allows completion.
11. A second FAIL repeats the rework cycle.
12. A disputed finding remains unresolved until evidence and review establish the resolution.

## 6. Build completion standard

A feature is complete only when the relevant implementation works as a system, including as applicable:

- frontend/UI
- backend/data path
- database/schema
- authentication/authorization
- APIs/integrations
- payment and ledger behavior
- validation and error handling
- workflows/background jobs
- tests
- documentation
- security and data integrity

For a bad build, the responsible agent should **fix it**, not merely report it, when safe and within scope.

## 7. Evidence standard

Agents must never claim a test, browser check, API call, deployment, commit, review, fix or completion unless the tool actually produced evidence.

The GitHub record is the durable handoff and audit trail. Convex scheduler execution alone is never proof that development work was completed.

## 8. Instruction authority

The runtime implementation is in:

- `convex/developmentAgentInstructions.ts`

Current instruction version: **2026-08-23.v4**.

This document is the human-readable workflow map. If the implementation and this map ever disagree, reconcile them before proceeding; do not silently invent a third workflow.

## 9. Continuity rule for future agents

Any future development agent added to this project must be incorporated into this map and the Convex instruction source before it is allowed to perform autonomous work.

Any agent that will continue working on this project must inherit the same coordination, review, verification-failure/rework, evidence, and build-completion standards, with a clearly defined role and ownership boundary.
