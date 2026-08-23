/*
 * Interplanetary Fund — Persistent Agent Orchestration
 *
 * Runs independently of the web client through Convex cron jobs.
 * This layer is intentionally a scheduler/dispatcher: it keeps the three
 * agent lanes alive, records heartbeats in existing agent memory, and can
 * optionally inspect GitHub when GITHUB_TOKEN is configured.
 */

import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const REPOSITORY = "interplanetarysister/interplanetary-fund";

type Lane = "agent-1" | "agent-2" | "agent-3";

const laneLabels: Record<Lane, string> = {
  "agent-1": "Agent 1",
  "agent-2": "Agent 2",
  "agent-3": "Agent 3",
};

export const heartbeat = internalMutation({
  args: {
    lane: v.union(v.literal("agent-1"), v.literal("agent-2"), v.literal("agent-3")),
  },
  handler: async (ctx, { lane }) => {
    const now = new Date().toISOString();
    const label = laneLabels[lane];
    const agents = await ctx.db.query("agents").collect();
    const matches = agents.filter(
      (agent) => agent.role.toLowerCase() === lane || agent.name.toLowerCase() === label.toLowerCase(),
    );

    const status = `Scheduler heartbeat ${now}: ${label} lane checked. Persistent Convex worker is active.`;

    for (const agent of matches) {
      const memory = agent.workingMemory || [];
      await ctx.db.patch(agent._id, {
        status: "active",
        workingMemory: [status, ...memory.filter((entry) => !entry.startsWith("Scheduler heartbeat ")).slice(0, 9)],
      });
    }

    return { lane, matchedAgents: matches.length, timestamp: now };
  },
});

export const pollGithub = action({
  args: {
    lane: v.union(v.literal("agent-1"), v.literal("agent-2"), v.literal("agent-3")),
  },
  handler: async (ctx, { lane }) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      await ctx.runMutation(internal.agentScheduler.heartbeat, { lane });
      return { lane, status: "heartbeat-only", reason: "GITHUB_TOKEN is not configured" };
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPOSITORY}/issues?state=open&per_page=20&sort=updated&direction=desc`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      await ctx.runMutation(internal.agentScheduler.heartbeat, { lane });
      throw new Error(`GitHub polling failed (${response.status}): ${detail.slice(0, 500)}`);
    }

    const issues = (await response.json()) as Array<{
      number: number;
      title: string;
      html_url: string;
      pull_request?: unknown;
    }>;

    const actionable = issues
      .filter((issue) => !issue.pull_request)
      .slice(0, 10)
      .map((issue) => `#${issue.number} ${issue.title} — ${issue.html_url}`);

    await ctx.runMutation(internal.agentScheduler.recordGithubWork, {
      lane,
      summary: actionable.length
        ? `Open GitHub work discovered: ${actionable.join(" | ")}`
        : "No open GitHub issues currently discovered by the scheduler.",
    });

    return { lane, status: "polled", actionableCount: actionable.length, actionable };
  },
});

export const recordGithubWork = internalMutation({
  args: {
    lane: v.union(v.literal("agent-1"), v.literal("agent-2"), v.literal("agent-3")),
    summary: v.string(),
  },
  handler: async (ctx, { lane, summary }) => {
    const now = new Date().toISOString();
    const label = laneLabels[lane];
    const agents = await ctx.db.query("agents").collect();
    const matches = agents.filter(
      (agent) => agent.role.toLowerCase() === lane || agent.name.toLowerCase() === label.toLowerCase(),
    );

    for (const agent of matches) {
      const memory = agent.workingMemory || [];
      await ctx.db.patch(agent._id, {
        status: "active",
        workingMemory: [`${now}: ${summary}`, ...memory.slice(0, 9)],
      });
    }

    return { lane, matchedAgents: matches.length, timestamp: now };
  },
});
