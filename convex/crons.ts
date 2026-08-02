import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// =====================================================
// SCHEDULED JOBS (Credit-Free — runs as Convex cron)
// =====================================================
// All times in UTC. Pacific is UTC-7 (PDT) or UTC-8 (PST).
// 6am Pacific = 13:00 UTC (during PDT)
// Saturday 2am Pacific = 09:00 UTC Saturday (during PDT)

const crons = cronJobs();

// Daily Protocol Enforcement — 6am Pacific (13:00 UTC)
crons.daily(
  "daily-protocol-enforcement",
  { hourUTC: 13, minuteUTC: 0 },
  internal.protocol.weeklyTraining,
  {}
);

// Weekly Training — Saturday 2am Pacific (09:00 UTC Saturday)
crons.weekly(
  "weekly-training-session",
  { dayOfWeek: "saturday", hourUTC: 9, minuteUTC: 0 },
  internal.protocol.weeklyTraining,
  {}
);

export default crons;
