import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// FACEBOOK GROUP OUTREACH SYSTEM
// Agent discovers, joins, and posts to relevant FB groups
// =====================================================

// ---- FACEBOOK CONNECTION MANAGEMENT ----

// Mutation: Connect a Facebook account
export const connectFacebook = mutation({
  args: {
    userId: v.string(),
    facebookUserId: v.string(),
    facebookUserName: v.string(),
    accessToken: v.string(),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already connected
    const existing = await ctx.db.query("facebookConnections")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        facebookUserId: args.facebookUserId,
        facebookUserName: args.facebookUserName,
        accessToken: args.accessToken,
        permissions: args.permissions,
        connectedAt: new Date().toISOString(),
        status: "active",
      });
      return { status: "updated", connectionId: existing._id };
    }

    const connectionId = await ctx.db.insert("facebookConnections", {
      ...args,
      connectedAt: new Date().toISOString(),
      status: "active",
    });
    return { status: "created", connectionId };
  },
});

// Query: Get Facebook connection status
export const getFacebookConnection = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const conn = await ctx.db.query("facebookConnections")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();
    if (!conn) return { status: "not_connected" };
    return {
      status: conn.status,
      facebookUserName: conn.facebookUserName,
      permissions: conn.permissions,
      connectedAt: conn.connectedAt,
    };
  },
});

// Mutation: Disconnect Facebook
export const disconnectFacebook = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const conn = await ctx.db.query("facebookConnections")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();
    if (conn) {
      await ctx.db.patch(conn._id, { status: "disconnected" });
    }
    return { status: "disconnected" };
  },
});

// ---- GROUP DISCOVERY ----

// Mutation: Store discovered groups for a campaign
// The agent searches FB groups based on campaign category + keywords
// and stores the results with relevance scores
export const discoverGroups = mutation({
  args: {
    campaignId: v.string(),
    campaignTitle: v.string(),
    campaignCategory: v.string(),
    groups: v.array(v.object({
      groupFacebookId: v.string(),
      groupName: v.string(),
      groupUrl: v.string(),
      memberCount: v.number(),
      groupCategory: v.string(),
      groupDescription: v.string(),
      relevanceScore: v.number(),
      canPost: v.boolean(),
    })),
  },
  handler: async (ctx, { campaignId, campaignTitle, campaignCategory, groups }) => {
    let created = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    for (const g of groups) {
      // Check if already discovered for this campaign
      const existing = await ctx.db.query("facebookGroups")
        .withIndex("byCampaignId", (q) => q.eq("campaignId", campaignId))
        .filter((q) => q.eq("groupFacebookId", g.groupFacebookId))
        .first();

      if (existing) {
        // Update relevance score if higher
        if (g.relevanceScore > existing.relevanceScore) {
          await ctx.db.patch(existing._id, { relevanceScore: g.relevanceScore });
        }
        skipped++;
        continue;
      }

      await ctx.db.insert("facebookGroups", {
        campaignId,
        campaignTitle,
        campaignCategory,
        groupFacebookId: g.groupFacebookId,
        groupName: g.groupName,
        groupUrl: g.groupUrl,
        memberCount: g.memberCount,
        groupCategory: g.groupCategory,
        groupDescription: g.groupDescription,
        relevanceScore: g.relevanceScore,
        joinStatus: "discovered",
        canPost: g.canPost,
        postsCount: 0,
        discoveredAt: now,
      });
      created++;
    }

    return {
      status: "success",
      discovered: created,
      skipped,
      total: groups.length,
    };
  },
});

// Query: Get discovered groups for a campaign
export const getDiscoveredGroups = query({
  args: {
    campaignId: v.string(),
    joinStatus: v.optional(v.string()),
  },
  handler: async (ctx, { campaignId, joinStatus }) => {
    let q = ctx.db.query("facebookGroups")
      .withIndex("byCampaignId", (q) => q.eq("campaignId", campaignId));

    const groups = await q.collect();

    if (joinStatus) {
      return groups.filter((g) => g.joinStatus === joinStatus);
    }
    return groups.sort((a, b) => b.relevanceScore - a.relevanceScore);
  },
});

// Query: Get all discovered groups across all campaigns (for dashboard)
export const getAllDiscoveredGroups = query({
  args: {},
  handler: async (ctx) => {
    const groups = await ctx.db.query("facebookGroups").collect();
    return {
      total: groups.length,
      discovered: groups.filter((g) => g.joinStatus === "discovered").length,
      joinRequested: groups.filter((g) => g.joinStatus === "join_requested").length,
      joined: groups.filter((g) => g.joinStatus === "joined").length,
      rejected: groups.filter((g) => g.joinStatus === "rejected").length,
      totalPosts: groups.reduce((s, g) => s + g.postsCount, 0),
      groups: groups.sort((a, b) => b.relevanceScore - a.relevanceScore),
    };
  },
});

// ---- GROUP JOIN MANAGEMENT ----

// Mutation: Request to join a group (agent action)
export const requestJoinGroup = mutation({
  args: {
    groupId: v.id("facebookGroups"),
  },
  handler: async (ctx, { groupId }) => {
    const group = await ctx.db.get(groupId);
    if (!group) return { status: "not_found" };

    await ctx.db.patch(groupId, {
      joinStatus: "join_requested",
      lastError: undefined,
    });

    return {
      status: "requested",
      groupName: group.groupName,
      groupUrl: group.groupUrl,
    };
  },
});

// Mutation: Bulk request join for multiple groups
export const bulkRequestJoin = mutation({
  args: {
    groupIds: v.array(v.id("facebookGroups")),
  },
  handler: async (ctx, { groupIds }) => {
    let requested = 0;
    let failed = 0;
    const results: any[] = [];

    for (const id of groupIds) {
      const group = await ctx.db.get(id);
      if (!group) {
        failed++;
        results.push({ id, status: "not_found" });
        continue;
      }
      await ctx.db.patch(id, { joinStatus: "join_requested" });
      requested++;
      results.push({ id, groupName: group.groupName, status: "requested" });
    }

    return { status: "success", requested, failed, results };
  },
});

// Mutation: Confirm group joined (after FB approves the join request)
export const confirmGroupJoined = mutation({
  args: {
    groupId: v.id("facebookGroups"),
  },
  handler: async (ctx, { groupId }) => {
    const group = await ctx.db.get(groupId);
    if (!group) return { status: "not_found" };

    await ctx.db.patch(groupId, {
      joinStatus: "joined",
      joinedAt: new Date().toISOString(),
      canPost: true,
    });

    return {
      status: "joined",
      groupName: group.groupName,
    };
  },
});

// Mutation: Bulk confirm joined
export const bulkConfirmJoined = mutation({
  args: {
    groupIds: v.array(v.id("facebookGroups")),
  },
  handler: async (ctx, { groupIds }) => {
    let joined = 0;
    const now = new Date().toISOString();

    for (const id of groupIds) {
      const group = await ctx.db.get(id);
      if (group) {
        await ctx.db.patch(id, {
          joinStatus: "joined",
          joinedAt: now,
          canPost: true,
        });
        joined++;
      }
    }

    return { status: "success", joined, total: groupIds.length };
  },
});

// Mutation: Mark group as rejected or failed
export const updateGroupJoinStatus = mutation({
  args: {
    groupId: v.id("facebookGroups"),
    joinStatus: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { groupId, joinStatus, error }) => {
    await ctx.db.patch(groupId, {
      joinStatus,
      lastError: error,
    });
    return { status: "updated" };
  },
});

// ---- POST MANAGEMENT ----

// Mutation: Create a scheduled post for a group
export const createGroupPost = mutation({
  args: {
    campaignId: v.string(),
    campaignTitle: v.string(),
    groupId: v.id("facebookGroups"),
    groupFacebookId: v.string(),
    groupName: v.string(),
    postType: v.string(),
    postContent: v.string(),
    scheduledFor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("facebookGroupPosts", {
      campaignId: args.campaignId,
      campaignTitle: args.campaignTitle,
      groupId: args.groupId,
      groupFacebookId: args.groupFacebookId,
      groupName: args.groupName,
      postType: args.postType,
      postContent: args.postContent,
      postStatus: args.scheduledFor ? "scheduled" : "pending",
      scheduledFor: args.scheduledFor,
      reactions: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
    });

    return { status: "success", postId };
  },
});

// Mutation: Bulk create posts across multiple joined groups
// The agent generates campaign content and posts to all joined groups at once
export const bulkCreateGroupPosts = mutation({
  args: {
    campaignId: v.string(),
    campaignTitle: v.string(),
    postType: v.string(),
    postContent: v.string(),
    targetGroupIds: v.array(v.id("facebookGroups")),
  },
  handler: async (ctx, { campaignId, campaignTitle, postType, postContent, targetGroupIds }) => {
    let created = 0;
    let failed = 0;
    const results: any[] = [];

    for (const groupId of targetGroupIds) {
      const group = await ctx.db.get(groupId);
      if (!group || group.joinStatus !== "joined" || !group.canPost) {
        failed++;
        results.push({ groupId, status: "cannot_post", reason: group ? group.joinStatus : "not_found" });
        continue;
      }

      const postId = await ctx.db.insert("facebookGroupPosts", {
        campaignId,
        campaignTitle,
        groupId,
        groupFacebookId: group.groupFacebookId,
        groupName: group.groupName,
        postType,
        postContent,
        postStatus: "pending",
        reactions: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString(),
      });

      created++;
      results.push({ postId, groupName: group.groupName, status: "created" });
    }

    return { status: "success", created, failed, total: targetGroupIds.length, results };
  },
});

// Mutation: Mark a post as posted (after agent successfully posts to FB)
export const markPostPosted = mutation({
  args: {
    postId: v.id("facebookGroupPosts"),
    postUrl: v.optional(v.string()),
  },
  handler: async (ctx, { postId, postUrl }) => {
    const post = await ctx.db.get(postId);
    if (!post) return { status: "not_found" };

    await ctx.db.patch(postId, {
      postStatus: "posted",
      postUrl,
      postedAt: new Date().toISOString(),
    });

    // Increment the group's post count
    const group = await ctx.db.get(post.groupId);
    if (group) {
      await ctx.db.patch(group._id, {
        postsCount: group.postsCount + 1,
        lastPostedAt: new Date().toISOString(),
      });
    }

    return { status: "posted" };
  },
});

// Mutation: Mark a post as failed
export const markPostFailed = mutation({
  args: {
    postId: v.id("facebookGroupPosts"),
    error: v.string(),
  },
  handler: async (ctx, { postId, error }) => {
    await ctx.db.patch(postId, {
      postStatus: "failed",
      error,
    });
    return { status: "failed" };
  },
});

// Mutation: Update post engagement stats (reactions, comments, shares)
export const updatePostEngagement = mutation({
  args: {
    postId: v.id("facebookGroupPosts"),
    reactions: v.number(),
    comments: v.number(),
    shares: v.number(),
  },
  handler: async (ctx, { postId, reactions, comments, shares }) => {
    await ctx.db.patch(postId, { reactions, comments, shares });
    return { status: "updated" };
  },
});

// Query: Get posts for a campaign
export const getCampaignPosts = query({
  args: {
    campaignId: v.string(),
    postStatus: v.optional(v.string()),
  },
  handler: async (ctx, { campaignId, postStatus }) => {
    let posts = await ctx.db.query("facebookGroupPosts")
      .withIndex("byCampaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    if (postStatus) {
      posts = posts.filter((p) => p.postStatus === postStatus);
    }

    return posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
});

// Query: Get all posts (for dashboard overview)
export const getAllPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("facebookGroupPosts").collect();
    return {
      total: posts.length,
      posted: posts.filter((p) => p.postStatus === "posted").length,
      pending: posts.filter((p) => p.postStatus === "pending").length,
      scheduled: posts.filter((p) => p.postStatus === "scheduled").length,
      failed: posts.filter((p) => p.postStatus === "failed").length,
      totalReactions: posts.reduce((s, p) => s + p.reactions, 0),
      totalComments: posts.reduce((s, p) => s + p.comments, 0),
      totalShares: posts.reduce((s, p) => s + p.shares, 0),
      posts: posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  },
});

// Query: Get posts for a specific group
export const getGroupPosts = query({
  args: {
    groupId: v.id("facebookGroups"),
  },
  handler: async (ctx, { groupId }) => {
    return await ctx.db.query("facebookGroupPosts")
      .withIndex("byGroupId", (q) => q.eq("groupId", groupId))
      .collect();
  },
});

// ---- ANALYTICS ----

// Query: Full Facebook outreach dashboard
export const getOutreachDashboard = query({
  args: { campaignId: v.optional(v.string()) },
  handler: async (ctx, { campaignId }) => {
    let groups = await ctx.db.query("facebookGroups").collect();
    let posts = await ctx.db.query("facebookGroupPosts").collect();

    if (campaignId) {
      groups = groups.filter((g) => g.campaignId === campaignId);
      posts = posts.filter((p) => p.campaignId === campaignId);
    }

    const joinedGroups = groups.filter((g) => g.joinStatus === "joined");
    const totalReach = joinedGroups.reduce((s, g) => s + g.memberCount, 0);

    return {
      groups: {
        total: groups.length,
        discovered: groups.filter((g) => g.joinStatus === "discovered").length,
        joinRequested: groups.filter((g) => g.joinStatus === "join_requested").length,
        joined: joinedGroups.length,
        rejected: groups.filter((g) => g.joinStatus === "rejected").length,
        totalReach,
      },
      posts: {
        total: posts.length,
        posted: posts.filter((p) => p.postStatus === "posted").length,
        pending: posts.filter((p) => p.postStatus === "pending").length,
        scheduled: posts.filter((p) => p.postStatus === "scheduled").length,
        failed: posts.filter((p) => p.postStatus === "failed").length,
        totalReactions: posts.reduce((s, p) => s + p.reactions, 0),
        totalComments: posts.reduce((s, p) => s + p.comments, 0),
        totalShares: posts.reduce((s, p) => s + p.shares, 0),
      },
      topGroups: joinedGroups
        .sort((a, b) => b.memberCount - a.memberCount)
        .slice(0, 5)
        .map((g) => ({
          name: g.groupName,
          members: g.memberCount,
          posts: g.postsCount,
          relevance: g.relevanceScore,
        })),
    };
  },
});
