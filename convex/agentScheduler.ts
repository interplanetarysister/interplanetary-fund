/*
 * Interplanetary Fund — Persistent Development Agent Orchestration
 *
 * Runs independently of the web client through Convex cron jobs.
 * These three lanes are autonomous development workers, separate from the
 * application's fundraising/communications agents. Convex owns scheduling,
 * identity, instructions, state and handoffs; GitHub is the project workspace.
 */

import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  getDevelopmentAgentInstructions,
  DEVELOPMENT_AGENT_INSTRUCTION_VERSION,
  type DevelopmentLane,
} from "./developmentAgentInstructions";

const REPOSITORY = "interplanetarysister/interplanetary-fund";

const laneLabels: Record<DevelopmentLane, string> = {
  "agent-1": "Agent 1",
  "agent-2": "Agent 2",
  "agent-3": "Agent 3",
};

const laneValidator = v.union(
  v.literal("agent-1"),
  v.literal("agent-2"),
  v.literal("agent-3"),
);

export const heartbeat = internalMutation({
  args: { lane: laneValidator },
  handler: async (ctx, { lane }) => {
    const now = new Date().toISOString();
    const label = laneLabels[lane];
    const instructionVersion = DEVELOPMENT_AGENT_INSTRUCTION_VERSION;
    const agents = await ctx.db.query("agents").collect();
    const matches = agents.filter(
      (agent) => agent.role.toLowerCase() === lane || agent.name.toLowerCase() === label.toLowerCase(),
    );

    const status = `Development scheduler heartbeat ${now}: ${label} lane checked. Convex instruction version ${instructionVersion}.`;

    for (const agent of matches) {
      const memory = agent.workingMemory || [];
      await ctx.db.patch(agent._id, {
        status: "active",
        workingMemory: [
          status,
          ...memory.filter((entry) => !entry.startsWith("Development scheduler heartbeat ")).slice(0, 9),
        ],
      });
    }

    return {
      lane,
      matchedAgents: matches.length,
      instructionVersion,
      instructionsLoaded: true,
      timestamp: now,
    };
  },
});

/**
 * Returns the authoritative Convex instructions for a development lane.
 * A real worker must load this before acting; the scheduler never treats a
 * heartbeat or GitHub poll as proof that implementation work was completed.
 */
export const getInstructions = action({
  args: { lane: laneValidator },
  handler: async (_ctx, { lane }) => ({
    lane,
    label: laneLabels[lane],
    instructionVersion: DEVELOPMENT_AGENT_INSTRUCTION_VERSION,
    instructions: getDevelopmentAgentInstructions(lane),
  }),
});

export const pollGithub = action({
  args: { lane: laneValidator },
  handler: async (ctx, { lane }) => {
    // Load the lane instructions before inspecting or dispatching any work.
    // This is intentionally done on every run so instruction changes deploy
    // with the Convex function rather than remaining in stale worker memory.
    const instructions = getDevelopmentAgentInstructions(lane);
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      await ctx.runMutation(internal.agentScheduler.heartbeat, { lane });
      return {
        lane,
        status: "heartbeat-only",
        instructionVersion: DEVELOPMENT_AGENT_INSTRUCTION_VERSION,
        instructionsLoaded: Boolean(instructions),
        reason: "GITHUB_TOKEN is not configured",
      };
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
      labels?: Array<{ name?: string }>;
    }>;

    const actionable = issues
      .filter((issue) => !issue.pull_request)
      .slice(0, 10)
      .map((issue) => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        labels: (issue.labels || []).map((label) => label.name).filter(Boolean),
      }));

    await ctx.runMutation(internal.agentScheduler.recordGithubWork, {
      lane,
      summary: actionable.length
        ? `Instructions ${DEVELOPMENT_AGENT_INSTRUCTION_VERSION} loaded. Open GitHub work discovered: ${actionable.map((issue) => `#${issue.number} ${issue.title}`).join(" | ")}`
        : `Instructions ${DEVELOPMENT_AGENT_INSTRUCTION_VERSION} loaded. No open GitHub issues currently discovered by the scheduler.`,
    });

    return {
      lane,
      status: "polled",
      instructionVersion: DEVELOPMENT_AGENT_INSTRUCTION_VERSION,
      instructionsLoaded: true,
      actionableCount: actionable.length,
      actionable,
    };
  },
});

export const recordGithubWork = internalMutation({
  args: {
    lane: laneValidator,
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
