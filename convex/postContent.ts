import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const BUSINESS_EMAIL = "interplanetarysister@gmail.com";

function generatePayPalLink(campaignTitle: string): string {
  const params = new URLSearchParams({
    cmd: "_donations",
    business: BUSINESS_EMAIL,
    item_name: `${campaignTitle} - Interplanetary Fund`,
    currency_code: "USD",
  });
  return `https://www.paypal.com/donate/?${params.toString()}`;
}

// Generate campaign post content with embedded PayPal link
export const generatePostContent = mutation({
  args: {
    campaignId: v.string(),
    campaignTitle: v.string(),
    platform: v.string(),
    customMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paypalLink = generatePayPalLink(args.campaignTitle);
    
    // Build the post content based on platform
    let content = args.customMessage || "";
    
    if (!content) {
      content = `🚀 ${args.campaignTitle}\n\nWe're raising funds to make a real difference. Your support means everything.\n\nEvery dollar counts. Together we can reach our goal! 💪`;
    }
    
    // ALWAYS append the PayPal donation block — this is mandatory
    const donationBlock = `\n\n💝 Donate now (any amount): ${paypalLink}\nThank you for your support! 🙏`;
    
    const fullContent = content + donationBlock;
    
    // For Facebook, also return the link separately for the link attachment field
    const isFacebook = args.platform.toLowerCase().includes("facebook");
    
    return {
      content: fullContent,
      paypalLink,
      linkAttachment: isFacebook ? paypalLink : undefined,
      platform: args.platform,
      campaignId: args.campaignId,
      characterCount: fullContent.length,
      hasPayPalLink: true,
    };
  },
});

// Check all existing DistributedPosts for missing PayPal links
export const auditPostLinks = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("distributedPosts").collect();
    const missingLinks = posts.filter(
      (p) => !p.content || !p.content.includes("paypal.com/donate")
    );
    return {
      totalPosts: posts.length,
      postsWithPayPalLink: posts.length - missingLinks.length,
      postsMissingLinks: missingLinks.map((p) => ({
        id: p._id,
        campaign: p.campaignTitle || p.campaignId,
        platform: p.platform,
        action: "needs_regen",
      })),
    };
  },
});

// Fix posts that are missing PayPal links by appending them
export const fixMissingPayPalLinks = mutation({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("distributedPosts").collect();
    const missingLinks = posts.filter(
      (p) => !p.content || !p.content.includes("paypal.com/donate")
    );
    
    let fixed = 0;
    for (const post of missingLinks) {
      const campaignTitle = post.campaignTitle || "Interplanetary Fund";
      const link = generatePayPalLink(campaignTitle);
      const donationBlock = `\n\n💝 Donate now (any amount): ${link}\nThank you! 🙏`;
      
      await ctx.db.patch(post._id, {
        content: (post.content || "") + donationBlock,
      });
      fixed++;
    }
    
    return {
      status: "success",
      postsChecked: posts.length,
      postsFixed: fixed,
    };
  },
});
