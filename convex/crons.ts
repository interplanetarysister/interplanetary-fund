import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// =====================================================
// SCHEDULED JOBS (Credit-Free — runs as Convex cron)
// =====================================================
// All times in UTC. Pacific is UTC-7 (PDT) or UTC-8 (PST).
// August 2026: PDT (UTC-7)
// 6am Pacific = 13:00 UTC
// Saturday 2am Pacific = 09:00 UTC Saturday

export const crons = cronJobs();

// Daily Protocol Enforcement — 6am Pacific (13:00 UTC)
// Runs enforceCampaignProtocol query (read-only audit)
crons.daily(
  "daily-protocol-enforcement",
  { hourUTC: 13, minuteUTC: 0 },
  internal.protocol.weeklyTraining, // Reuses the training mutation for audit + agent update
  {}
);

// Weekly Training — Saturday 2am Pacific (09:00 UTC Saturday)
// Full audit + agent training update + report creation
crons.weekly(
  "weekly-training-session",
  { dayOfWeek: "saturday", hourUTC: 9, minuteUTC: 0 },
  internal.protocol.weeklyTraining,
  {}
);
