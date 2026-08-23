/*
 * Interplanetary Fund — Copyright © 2026 Michelle Rogers. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL. Do not copy, distribute, or modify without
 * express written permission. See LICENSE file for full terms.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// =====================================================
// SCHEDULED JOBS (Credit-Free — runs as Convex cron)
// =====================================================
// Persistent agent orchestration is deliberately hosted in Convex so it does
// not depend on a browser session being open. Agent lanes poll independently.

const crons = cronJobs();

// Agent 2 — every 5 minutes.
crons.interval(
  "agent-2-persistent-work-poll",
  { minutes: 5 },
  internal.agentScheduler.pollGithub,
  { lane: "agent-2" }
);

// Agent 1 — every 10 minutes.
crons.interval(
  "agent-1-persistent-work-poll",
  { minutes: 10 },
  internal.agentScheduler.pollGithub,
  { lane: "agent-1" }
);

// Agent 3 — every 15 minutes.
crons.interval(
  "agent-3-persistent-work-poll",
  { minutes: 15 },
  internal.agentScheduler.pollGithub,
  { lane: "agent-3" }
);

// Daily Protocol Enforcement — 6am Pacific (13:00 UTC during PDT).
crons.daily(
  "daily-protocol-enforcement",
  { hourUTC: 13, minuteUTC: 0 },
  internal.protocol.weeklyTraining,
  {}
);

// Weekly Training — Saturday 2am Pacific (09:00 UTC during PDT).
crons.weekly(
  "weekly-training-session",
  { dayOfWeek: "saturday", hourUTC: 9, minuteUTC: 0 },
  internal.protocol.weeklyTraining,
  {}
);

// Daily Auto-Post Generation — 8am Pacific (15:00 UTC during PDT).
crons.daily(
  "daily-post-generation",
  { hourUTC: 15, minuteUTC: 0 },
  internal.postContent.autoGeneratePosts,
  {}
);

export default crons;
