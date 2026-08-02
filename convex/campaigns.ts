import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// CAMPAIGN SYNC & EXTERNAL PLATFORMS
// =====================================================

// Query: Get all monitored campaigns
export const getCampaigns = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return await ctx.db.query("monitoredCampaigns")
        .filter((q) => q.eq("status", status))
        .collect();
    }
    return await ctx.db.query("monitoredCampaigns").collect();
  },
});

// Mutation: Sync/update a campaign in the mirror
export const syncCampaign = mutation({
  args: {
    ifCampaignId: v.string(),
    title: v.string(),
    status: v.string(),
    goalAmount: v.number(),
    raisedAmount: v.number(),
    donorCount: v.number(),
    outreachEnabled: v.boolean(),
    aiTone: v.string(),
    aiIdealDonors: v.string(),
    aiInterestedOrgs: v.string(),
    aiPlatforms: v.string(),
    aiPriority: v.string(),
    storyPresent: v.boolean(),
    summary: v.string(),
    category: v.string(),
    endDate: v.string(),
    coverImagePresent: v.boolean(),
    paymentActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if campaign already exists in mirror
    const existing = await ctx.db.query("monitoredCampaigns")
      .filter((q) => q.eq("ifCampaignId", args.ifCampaignId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        lastSynced: new Date().toISOString(),
      });
      return { status: "updated", campaignId: existing._id };
    } else {
      const campaignId = await ctx.db.insert("monitoredCampaigns", {
        ...args,
        lastSynced: new Date().toISOString(),
      });
      return { status: "created", campaignId };
    }
  },
});

// Mutation: Bulk sync campaigns
export const bulkSyncCampaigns = mutation({
  args: {
    campaigns: v.array(v.object({
      ifCampaignId: v.string(),
      title: v.string(),
      status: v.string(),
      goalAmount: v.number(),
      raisedAmount: v.number(),
      donorCount: v.number(),
      outreachEnabled: v.boolean(),
      aiTone: v.string(),
      aiIdealDonors: v.string(),
      aiInterestedOrgs: v.string(),
      aiPlatforms: v.string(),
      aiPriority: v.string(),
      storyPresent: v.boolean(),
      summary: v.string(),
      category: v.string(),
      endDate: v.string(),
      coverImagePresent: v.boolean(),
      paymentActive: v.boolean(),
    })),
  },
  handler: async (ctx, { campaigns }) => {
    let updated = 0;
    let created = 0;

    for (const c of campaigns) {
      const existing = await ctx.db.query("monitoredCampaigns")
        .filter((q) => q.eq("ifCampaignId", c.ifCampaignId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { ...c, lastSynced: new Date().toISOString() });
        updated++;
      } else {
        await ctx.db.insert("monitoredCampaigns", { ...c, lastSynced: new Date().toISOString() });
        created++;
      }
    }

    return { status: "success", updated, created, total: campaigns.length };
  },
});

// =====================================================
// EXTERNAL PLATFORM CONNECTIONS
// =====================================================

// Query: Get all external platforms for a user
export const getExternalPlatforms = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query("externalPlatforms")
      .filter((q) => q.eq("userId", userId))
      .collect();
  },
});

// Mutation: Connect an external platform
export const connectExternalPlatform = mutation({
  args: {
    userId: v.string(),
    platformName: v.string(),
    campaignUrl: v.string(),
    campaignTitle: v.string(),
    connectionType: v.string(),
    authToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const platformId = await ctx.db.insert("externalPlatforms", {
      ...args,
      raisedAmount: 0,
      goalAmount: 0,
      donorCount: 0,
      lastSynced: "",
      syncStatus: "pending",
    });
    return { status: "success", platformId };
  },
});

// Mutation: Update external platform sync data
export const updateExternalPlatformSync = mutation({
  args: {
    platformId: v.id("externalPlatforms"),
    raisedAmount: v.number(),
    goalAmount: v.number(),
    donorCount: v.number(),
    syncStatus: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.platformId, {
      raisedAmount: args.raisedAmount,
      goalAmount: args.goalAmount,
      donorCount: args.donorCount,
      syncStatus: args.syncStatus,
      lastSynced: new Date().toISOString(),
    });
    return { status: "success" };
  },
});

// Query: Get all external platform balances (for dashboard)
export const getAllExternalBalances = query({
  args: {},
  handler: async (ctx) => {
    const platforms = await ctx.db.query("externalPlatforms").collect();
    return {
      total: platforms.length,
      byPlatform: platforms.reduce((acc, p) => {
        if (!acc[p.platformName]) {
          acc[p.platformName] = { count: 0, totalRaised: 0, totalDonors: 0, campaigns: [] as any[] };
        }
        acc[p.platformName].count++;
        acc[p.platformName].totalRaised += p.raisedAmount;
        acc[p.platformName].totalDonors += p.donorCount;
        acc[p.platformName].campaigns.push({
          title: p.campaignTitle,
          url: p.campaignUrl,
          raised: p.raisedAmount,
          donors: p.donorCount,
          lastSynced: p.lastSynced,
          syncStatus: p.syncStatus,
        });
        return acc;
      }, {} as Record<string, any>),
      grandTotalRaised: platforms.reduce((s, p) => s + p.raisedAmount, 0),
      grandTotalDonors: platforms.reduce((s, p) => s + p.donorCount, 0),
    };
  },
});
