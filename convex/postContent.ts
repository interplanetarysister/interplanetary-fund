import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate campaign post content with embedded PayPal link
export const generatePostContent = mutation({
  args: {
    campaignId: v.string(),
    campaignTitle: v.string(),
    platform: v.string(),
    customMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate the PayPal one-click link
    const businessEmail = "interplanetarysister@gmail.com";
    const paypalParams = new URLSearchParams({
      cmd: "_donations",
      business: businessEmail,
      item_name: `${args.campaignTitle} - Interplanetary Fund`,
      currency_code: "USD",
    });
    const paypalLink = `https://www.paypal.com/donate/?${paypalParams.toString()}`;

    // Build the post content based on platform
    let content = args.customMessage || "";

    if (!content) {
      // Default template
      content = `🚀 ${args.campaignTitle}\n\nWe're raising funds to make a real difference. Your support means everything.\n\nEvery dollar counts. Together we can reach our goal! 💪`;
    }

    // Append the donation block — this is ALWAYS included
    // Even if someone copy-pastes the post, the link travels with it
    const donationBlock = `\n\n💝 Donate now (any amount): ${paypalLink}\nThank you for your support! 🙏`;

    const fullContent = content + donationBlock;

    return {
      content: fullContent,
      paypalLink,
      platform: args.platform,
      campaignId: args.campaignId,
      characterCount: fullContent.length,
    };
  },
});

// Get all posts that should have PayPal links and verify they do
export const auditPostLinks = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("distributedPosts").collect();
    const missingLinks = posts.filter(
      (p) => !p.content.includes("paypal.com/donate")
    );
    return {
      totalPosts: posts.length,
      postsWithPayPalLink: posts.length - missingLinks.length,
      postsMissingLinks: missingLinks.map((p) => ({
        id: p._id,
        campaign: p.campaignTitle,
        platform: p.platform,
      })),
    };
  },
});
