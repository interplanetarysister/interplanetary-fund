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
        .withIndex("byStatus", (q) => q.eq("status", status))
        .collect();
    }
    return await ctx.db.query("monitoredCampaigns").collect();
  },
});

// Mutation: Update campaign cover image
export const updateCoverImage = mutation({
  args: {
    ifCampaignId: v.string(),
    coverImageUrl: v.string(),
  },
  handler: async (ctx, { ifCampaignId, coverImageUrl }) => {
    const existing = await ctx.db.query("monitoredCampaigns")
      .withIndex("byIfId", (q) => q.eq("ifCampaignId", ifCampaignId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        coverImageUrl,
        coverImagePresent: true,
        lastSynced: new Date().toISOString(),
      });
      return { status: "updated", campaignId: existing._id };
    }
    return { status: "not_found", ifCampaignId };
  },
});

// Mutation: Record a donation
export const recordDonation = mutation({
  args: {
    campaignId: v.string(),
    campaignTitle: v.string(),
    amount: v.number(),
    donorName: v.string(),
    message: v.optional(v.string()),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const donationId = await ctx.db.insert("donations", {
      ...args,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    // Update campaign raised amount and donor count
    const campaign = await ctx.db
      .query("monitoredCampaigns")
      .withIndex("byIfId", (q) => q.eq("ifCampaignId", args.campaignId))
      .first();

    if (campaign) {
      await ctx.db.patch(campaign._id, {
        raisedAmount: campaign.raisedAmount + args.amount,
        donorCount: campaign.donorCount + 1,
        lastSynced: new Date().toISOString(),
      });
    }

    return { status: "success", donationId };
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
    const existing = await ctx.db.query("monitoredCampaigns")
      .withIndex("byIfId", (q) => q.eq("ifCampaignId", args.ifCampaignId))
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
        .withIndex("byIfId", (q) => q.eq("ifCampaignId", c.ifCampaignId))
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

// Query: Get donations for a campaign
export const getDonations = query({
  args: { campaignId: v.optional(v.string()) },
  handler: async (ctx, { campaignId }) => {
    if (campaignId) {
      return await ctx.db.query("donations")
        .withIndex("byCampaignId", (q) => q.eq("campaignId", campaignId))
        .collect();
    }
    return await ctx.db.query("donations").collect();
  },
});

// =====================================================
// EXTERNAL PLATFORM CONNECTIONS
// =====================================================

export const getExternalPlatforms = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query("externalPlatforms")
      .filter((q) => q.eq("userId", userId))
      .collect();
  },
});

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
