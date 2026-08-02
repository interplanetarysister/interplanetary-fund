import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// SUPPORTER INTERACTIONS — Reusable for ANY campaign
// =====================================================

// Query: Get interactions for a specific campaign
export const getCampaignInteractions = query({
  args: {
    campaignId: v.string(),
    interactionType: v.optional(v.string()),
  },
  handler: async (ctx, { campaignId, interactionType }) => {
    if (interactionType) {
      return await ctx.db.query("supporterInteractions")
        .withIndex("byCampaignId", (q) => q.eq("campaignId", campaignId))
        .filter((qq) => qq.eq("interactionType", interactionType))
        .collect();
    }
    return await ctx.db.query("supporterInteractions")
      .withIndex("byCampaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
  },
});

// Query: Get interaction counts for a campaign
export const getInteractionStats = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const interactions = await ctx.db.query("supporterInteractions")
      .withIndex("byCampaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    const stats = {
      total: interactions.length,
      views: interactions.filter((i) => i.interactionType === "view").length,
      shares: interactions.filter((i) => i.interactionType === "share").length,
      follows: interactions.filter((i) => i.interactionType === "follow").length,
      clicks: interactions.filter((i) => i.interactionType === "click").length,
      uniqueSupporters: new Set(
        interactions
          .filter((i) => i.supporterId)
          .map((i) => i.supporterId!)
      ).size,
    };

    return stats;
  },
});

// Query: Get aggregate interaction stats across ALL campaigns
export const getAllInteractionStats = query({
  args: {},
  handler: async (ctx) => {
    const allInteractions = await ctx.db.query("supporterInteractions").collect();
    const allDonations = await ctx.db.query("donations").collect();

    // Group by campaign
    const byCampaign: Record<string, any> = {};
    for (const i of allInteractions) {
      if (!byCampaign[i.campaignId]) {
        byCampaign[i.campaignId] = {
          campaignId: i.campaignId,
          campaignTitle: i.campaignTitle,
          views: 0,
          shares: 0,
          follows: 0,
          clicks: 0,
          donations: 0,
          donationTotal: 0,
        };
      }
      if (i.interactionType === "view") byCampaign[i.campaignId].views++;
      if (i.interactionType === "share") byCampaign[i.campaignId].shares++;
      if (i.interactionType === "follow") byCampaign[i.campaignId].follows++;
      if (i.interactionType === "click") byCampaign[i.campaignId].clicks++;
    }

    // Add donation stats
    for (const d of allDonations) {
      if (!byCampaign[d.campaignId]) {
        byCampaign[d.campaignId] = {
          campaignId: d.campaignId,
          campaignTitle: d.campaignTitle,
          views: 0,
          shares: 0,
          follows: 0,
          clicks: 0,
          donations: 0,
          donationTotal: 0,
        };
      }
      byCampaign[d.campaignId].donations++;
      byCampaign[d.campaignId].donationTotal += d.amount;
    }

    return {
      totalInteractions: allInteractions.length,
      totalDonations: allDonations.length,
      totalRaised: allDonations.reduce((s, d) => s + d.amount, 0),
      campaigns: Object.values(byCampaign),
    };
  },
});

// Mutation: Record a single interaction (view, share, follow, click)
export const recordInteraction = mutation({
  args: {
    campaignId: v.string(),
    campaignTitle: v.string(),
    interactionType: v.string(),
    supporterName: v.optional(v.string()),
    supporterId: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const interactionId = await ctx.db.insert("supporterInteractions", {
      ...args,
      createdAt: new Date().toISOString(),
    });
    return { status: "success", interactionId };
  },
});

// Mutation: Bulk record interactions for multiple campaigns/users
// Reusable for any group of campaigns — present or future
export const bulkRecordInteractions = mutation({
  args: {
    interactions: v.array(v.object({
      campaignId: v.string(),
      campaignTitle: v.string(),
      interactionType: v.string(),
      supporterName: v.optional(v.string()),
      supporterId: v.optional(v.string()),
      metadata: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { interactions }) => {
    const results: any[] = [];
    for (const i of interactions) {
      const id = await ctx.db.insert("supporterInteractions", {
        ...i,
        createdAt: new Date().toISOString(),
      });
      results.push({ campaignId: i.campaignId, interactionId: id });
    }
    return { status: "success", count: results.length, results };
  },
});

// Mutation: Bulk record donations for multiple campaigns
// Reusable for any campaign — handles raised amount + donor count updates
export const bulkRecordDonations = mutation({
  args: {
    donations: v.array(v.object({
      campaignId: v.string(),
      campaignTitle: v.string(),
      amount: v.number(),
      donorName: v.string(),
      message: v.optional(v.string()),
      paymentMethod: v.string(),
    })),
  },
  handler: async (ctx, { donations }) => {
    let totalRecorded = 0;
    const results: any[] = [];

    for (const d of donations) {
      // Insert donation record
      const donationId = await ctx.db.insert("donations", {
        ...d,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Update campaign raised amount and donor count
      const campaign = await ctx.db.query("monitoredCampaigns")
        .withIndex("byIfId", (q) => q.eq("ifCampaignId", d.campaignId))
        .first();

      if (campaign) {
        await ctx.db.patch(campaign._id, {
          raisedAmount: campaign.raisedAmount + d.amount,
          donorCount: campaign.donorCount + 1,
          lastSynced: new Date().toISOString(),
        });
      }

      results.push({ donationId, campaignId: d.campaignId, amount: d.amount });
      totalRecorded++;
    }

    return { status: "success", count: totalRecorded, results };
  },
});

// Mutation: Bulk update campaign fields — works for ANY set of campaigns
// Use case: activate payments on all, enable outreach on all, change status, etc.
export const bulkUpdateCampaigns = mutation({
  args: {
    campaignIds: v.array(v.string()),
    updates: v.object({
      status: v.optional(v.string()),
      paymentActive: v.optional(v.boolean()),
      outreachEnabled: v.optional(v.boolean()),
      coverImageUrl: v.optional(v.string()),
      coverImagePresent: v.optional(v.boolean()),
      summary: v.optional(v.string()),
      aiTone: v.optional(v.string()),
      aiPriority: v.optional(v.string()),
      aiIdealDonors: v.optional(v.string()),
      aiPlatforms: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { campaignIds, updates }) => {
    let updated = 0;
    let notFound = 0;
    const results: any[] = [];

    for (const ifCampaignId of campaignIds) {
      const campaign = await ctx.db.query("monitoredCampaigns")
        .withIndex("byIfId", (q) => q.eq("ifCampaignId", ifCampaignId))
        .first();

      if (campaign) {
        // Only patch non-undefined fields
        const patch: any = { lastSynced: new Date().toISOString() };
        if (updates.status !== undefined) patch.status = updates.status;
        if (updates.paymentActive !== undefined) patch.paymentActive = updates.paymentActive;
        if (updates.outreachEnabled !== undefined) patch.outreachEnabled = updates.outreachEnabled;
        if (updates.coverImageUrl !== undefined) {
          patch.coverImageUrl = updates.coverImageUrl;
          patch.coverImagePresent = true;
        }
        if (updates.coverImagePresent !== undefined) patch.coverImagePresent = updates.coverImagePresent;
        if (updates.summary !== undefined) patch.summary = updates.summary;
        if (updates.aiTone !== undefined) patch.aiTone = updates.aiTone;
        if (updates.aiPriority !== undefined) patch.aiPriority = updates.aiPriority;
        if (updates.aiIdealDonors !== undefined) patch.aiIdealDonors = updates.aiIdealDonors;
        if (updates.aiPlatforms !== undefined) patch.aiPlatforms = updates.aiPlatforms;

        await ctx.db.patch(campaign._id, patch);
        updated++;
        results.push({ campaignId: ifCampaignId, status: "updated" });
      } else {
        notFound++;
        results.push({ campaignId: ifCampaignId, status: "not_found" });
      }
    }

    return { status: "success", updated, notFound, total: campaignIds.length, results };
  },
});

// Mutation: Activate payments for ALL active campaigns at once
export const activatePaymentsForAll = mutation({
  args: {},
  handler: async (ctx) => {
    const activeCampaigns = await ctx.db.query("monitoredCampaigns")
      .withIndex("byStatus", (q) => q.eq("status", "active"))
      .collect();

    let activated = 0;
    for (const c of activeCampaigns) {
      if (!c.paymentActive) {
        await ctx.db.patch(c._id, {
          paymentActive: true,
          lastSynced: new Date().toISOString(),
        });
        activated++;
      }
    }

    return {
      status: "success",
      activated,
      totalActive: activeCampaigns.length,
      message: `Payments activated on ${activated} of ${activeCampaigns.length} active campaigns`,
    };
  },
});

// Mutation: Sync external platform totals to campaigns in bulk
// For when GoFundMe/Facebook/etc data comes in for multiple campaigns
export const bulkSyncExternalTotals = mutation({
  args: {
    syncs: v.array(v.object({
      ifCampaignId: v.string(),
      externalRaised: v.number(),
      externalDonors: v.number(),
      platformCount: v.optional(v.number()),
    })),
  },
  handler: async (ctx, { syncs }) => {
    let updated = 0;
    for (const s of syncs) {
      const campaign = await ctx.db.query("monitoredCampaigns")
        .withIndex("byIfId", (q) => q.eq("ifCampaignId", s.ifCampaignId))
        .first();

      if (campaign) {
        await ctx.db.patch(campaign._id, {
          externalRaised: s.externalRaised,
          externalDonors: s.externalDonors,
          platformCount: s.platformCount ?? campaign.platformCount,
          lastSynced: new Date().toISOString(),
        });
        updated++;
      }
    }

    return { status: "success", updated, total: syncs.length };
  },
});

// Query: Get full campaign dashboard data — interactions + donations + external
// One call for everything the frontend needs
export const getCampaignDashboard = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db.query("monitoredCampaigns")
      .withIndex("byIfId", (q) => q.eq("ifCampaignId", campaignId))
      .first();

    if (!campaign) return { status: "not_found" };

    const donations = await ctx.db.query("donations")
      .withIndex("byCampaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    const interactions = await ctx.db.query("supporterInteractions")
      .withIndex("byCampaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    return {
      status: "success",
      campaign,
      stats: {
        totalDonations: donations.length,
        totalDonated: donations.reduce((s, d) => s + d.amount, 0),
        totalInteractions: interactions.length,
        views: interactions.filter((i) => i.interactionType === "view").length,
        shares: interactions.filter((i) => i.interactionType === "share").length,
        follows: interactions.filter((i) => i.interactionType === "follow").length,
        clicks: interactions.filter((i) => i.interactionType === "click").length,
        recentDonations: donations.slice(-5).reverse(),
      },
    };
  },
});
