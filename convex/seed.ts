import { mutation } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// SEED DATA — Initialize agents, campaigns, and fee config
// Run once after deploying to Convex
// =====================================================

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results: any = { agents: 0, campaigns: 0, feeConfig: false };

    // SEED 1: Fee Configuration
    const existingFee = await ctx.db.query("feeConfig").filter((q) => q.eq("active", true)).first();
    if (!existingFee) {
      await ctx.db.insert("feeConfig", {
        platformFeePercent: 5,
        processingFeePercent: 2.9,
        processingFeeFlat: 0.30,
        active: true,
        updatedBy: "lyra",
        updatedAt: new Date().toISOString(),
      });
      results.feeConfig = true;
    }

    // SEED 2: 7 Agents
    const existingAgents = await ctx.db.query("agents").collect();
    if (existingAgents.length === 0) {
      const agents = [
        {
          name: "Fundraising Agent",
          role: "fundraising",
          purpose: "Optimize campaign performance, manage donor outreach, and maximize revenue across all Interplanetary Fund campaigns.",
          description: "Campaign optimization, donor outreach automation, and revenue maximization specialist.",
          capabilities: ["campaign optimization", "donor outreach", "revenue tracking", "conversion optimization", "outreach automation"],
          specialization: "Fundraising and campaign revenue optimization",
          knowledgeAreas: ["crowdfunding", "donor psychology", "outreach strategy", "social media fundraising"],
          trustScore: 82, reliabilityScore: 84, efficiencyScore: 85, collaborationScore: 78,
          permissions: ["read_knowledge", "write_experimental_knowledge", "execute_assigned_tasks", "manage_campaigns"],
          responsibilities: ["optimize campaign performance", "manage outreach campaigns", "track revenue progress", "identify fundraising opportunities"],
          toolsAvailable: ["campaign audit", "outreach optimizer", "revenue projector"],
          allowedActions: ["enable_outreach", "optimize_campaign", "track_revenue", "assign_task"],
          approvalRequired: true, dataAccessLevel: "write",
          limitations: ["cannot modify payment integration", "cannot change campaign schema"],
          restrictedActions: ["delete_campaign", "modify_payments"],
          workflowAccess: ["campaign", "outreach", "revenue"],
          managedCampaigns: [],
          accentColor: "#22d3ee",
        },
        {
          name: "Story Agent",
          role: "story",
          purpose: "Generate, optimize, and A/B test AI campaign stories to maximize donor conversion.",
          description: "AI campaign story generation, optimization, and conversion-focused copywriting.",
          capabilities: ["story generation", "story optimization", "A/B testing", "SEO optimization", "accessibility compliance"],
          specialization: "Campaign storytelling and donor conversion",
          knowledgeAreas: ["copywriting", "donor psychology", "SEO", "accessibility standards", "emotional design"],
          trustScore: 80, reliabilityScore: 82, efficiencyScore: 83, collaborationScore: 78,
          permissions: ["read_knowledge", "write_experimental_knowledge", "execute_assigned_tasks", "manage_stories"],
          responsibilities: ["generate campaign stories", "optimize story content for conversion", "ensure SEO and accessibility compliance"],
          toolsAvailable: ["story optimizer", "campaign audit"],
          allowedActions: ["generate_story", "optimize_story", "create_story_version", "flag_story_issue"],
          approvalRequired: true, dataAccessLevel: "write",
          limitations: ["cannot publish without approval", "cannot modify campaign structure"],
          restrictedActions: ["delete_campaign", "change_goal_amount"],
          workflowAccess: ["campaign", "story"],
          managedCampaigns: [],
          accentColor: "#f472b6",
        },
        {
          name: "Donor Relations Agent",
          role: "donor_relations",
          purpose: "Manage donor engagement, retention, and communication to build long-term donor relationships.",
          description: "Donor engagement, retention, and relationship management specialist.",
          capabilities: ["donor engagement", "retention strategy", "thank-you automation", "donor segmentation", "communication management"],
          specialization: "Donor relationship management and retention",
          knowledgeAreas: ["donor psychology", "retention strategies", "communication best practices", "donor segmentation"],
          trustScore: 81, reliabilityScore: 83, efficiencyScore: 82, collaborationScore: 85,
          permissions: ["read_knowledge", "write_experimental_knowledge", "execute_assigned_tasks", "manage_donors"],
          responsibilities: ["manage donor communications", "implement retention strategies", "automate thank-you flows"],
          toolsAvailable: ["donor pipeline", "outreach optimizer"],
          allowedActions: ["send_donor_message", "segment_donors", "create_retention_campaign", "flag_donor_issue"],
          approvalRequired: true, dataAccessLevel: "write",
          limitations: ["cannot process payments", "cannot modify campaign goals"],
          restrictedActions: ["delete_donor", "process_refund"],
          workflowAccess: ["donor", "communication", "retention"],
          managedCampaigns: [],
          accentColor: "#4ade80",
        },
        {
          name: "Protocol Agent",
          role: "protocol",
          purpose: "Monitor campaign compliance with the Campaign Protocol and enforce standards across all campaigns.",
          description: "Campaign protocol compliance monitoring and enforcement.",
          capabilities: ["compliance monitoring", "protocol enforcement", "violation detection", "compliance reporting"],
          specialization: "Protocol compliance and campaign governance",
          knowledgeAreas: ["Campaign Protocol P-1 through P-8", "compliance standards", "audit procedures"],
          trustScore: 90, reliabilityScore: 92, efficiencyScore: 89, collaborationScore: 80,
          permissions: ["read_knowledge", "write_experimental_knowledge", "execute_assigned_tasks", "audit_campaigns"],
          responsibilities: ["audit campaigns against protocol", "flag violations", "auto-fix outreach settings", "report compliance status"],
          toolsAvailable: ["platform health", "campaign audit"],
          allowedActions: ["audit_campaign", "flag_violation", "auto_fix_outreach", "report_compliance"],
          approvalRequired: false, dataAccessLevel: "read",
          limitations: ["can only auto-fix outreach_enabled", "cannot modify stories or payments"],
          restrictedActions: ["modify_payment", "delete_campaign", "change_goal_amount"],
          workflowAccess: ["campaign", "protocol", "audit"],
          managedCampaigns: [],
          accentColor: "#f87171",
        },
        {
          name: "Analytics Agent",
          role: "analytics",
          purpose: "Track revenue, analyze donor data, and generate performance reports for the Interplanetary Fund.",
          description: "Revenue tracking, donor analytics, and performance reporting.",
          capabilities: ["revenue tracking", "donor analytics", "performance reporting", "trend analysis", "ROI calculation"],
          specialization: "Data analysis and revenue intelligence",
          knowledgeAreas: ["fundraising metrics", "donor analytics", "revenue forecasting", "data visualization"],
          trustScore: 86, reliabilityScore: 88, efficiencyScore: 87, collaborationScore: 82,
          permissions: ["read_knowledge", "write_experimental_knowledge", "execute_assigned_tasks", "generate_reports"],
          responsibilities: ["track campaign revenue", "analyze donor data", "generate weekly reports", "identify revenue trends"],
          toolsAvailable: ["revenue projector", "revenue audit"],
          allowedActions: ["generate_report", "track_revenue", "analyze_donors", "flag_trend"],
          approvalRequired: false, dataAccessLevel: "read",
          limitations: ["read-only access to campaign data", "cannot modify campaigns"],
          restrictedActions: ["modify_campaign", "delete_data"],
          workflowAccess: ["campaign", "revenue", "reporting"],
          managedCampaigns: [],
          accentColor: "#a78bfa",
        },
        {
          name: "Treasury Agent",
          role: "treasury",
          purpose: "Manage holding accounts, calculate fees, process payouts, and track all fund flows across the Interplanetary Fund platform.",
          description: "Manages holding accounts, calculates fees, processes payouts via CashApp/Bitcoin/PayPal, and tracks all fund flows.",
          capabilities: ["fee calculation", "payout processing", "balance tracking", "fund reconciliation", "payout method management"],
          specialization: "Financial operations, holding accounts, and payout management",
          knowledgeAreas: ["payment processing", "fee structures", "CashApp API", "PayPal Payouts API", "Bitcoin transactions", "escrow management"],
          trustScore: 88, reliabilityScore: 90, efficiencyScore: 88, collaborationScore: 80,
          permissions: ["read_knowledge", "write_experimental_knowledge", "execute_assigned_tasks", "manage_treasury"],
          responsibilities: ["calculate payout fees (gross to net)", "track holding account balances", "process payout requests", "reconcile fund flows"],
          toolsAvailable: ["treasury manager", "revenue projector"],
          allowedActions: ["calculate_payout", "process_payout", "track_balance", "reconcile_funds", "flag_discrepancy"],
          approvalRequired: true, dataAccessLevel: "write",
          limitations: ["cannot move funds without approval", "cannot modify fee structure without Michelle's approval"],
          restrictedActions: ["modify_fee_structure", "approve_payout", "access_external_funds", "delete_transaction"],
          workflowAccess: ["treasury", "payout", "holding_account"],
          managedCampaigns: [],
          accentColor: "#fbbf24",
        },
        {
          name: "Platform Sync Agent",
          role: "platform_sync",
          purpose: "Connect external crowdfunding platforms and sync campaign data for real-time dashboard display across all accounts.",
          description: "Connects external crowdfunding platforms (GoFundMe, Kickstarter, etc.) and syncs campaign data for live dashboard display.",
          capabilities: ["API connections", "data synchronization", "webhook handling", "balance aggregation", "multi-platform sync"],
          specialization: "External platform integration and data synchronization",
          knowledgeAreas: ["GoFundMe API", "Kickstarter", "Facebook Fundraisers", "OAuth flows", "webhook receivers", "API polling"],
          trustScore: 84, reliabilityScore: 85, efficiencyScore: 86, collaborationScore: 82,
          permissions: ["read_knowledge", "write_experimental_knowledge", "execute_assigned_tasks", "sync_platforms"],
          responsibilities: ["sync external platform campaign data", "detect new donations on connected platforms", "aggregate balances across all platforms"],
          toolsAvailable: ["campaign audit", "platform health"],
          allowedActions: ["sync_platform_data", "detect_new_donation", "update_campaign_balance", "flag_sync_error", "report_sync_status"],
          approvalRequired: false, dataAccessLevel: "read",
          limitations: ["read-only access to external platforms", "cannot process payments", "dependent on platform API availability"],
          restrictedActions: ["process_payment", "modify_campaign", "delete_connection", "access_user_credentials"],
          workflowAccess: ["campaign", "platform_sync", "dashboard"],
          managedCampaigns: [],
          accentColor: "#34d399",
        },
      ];

      for (const agent of agents) {
        await ctx.db.insert("agents", {
          ...agent,
          workingMemory: [],
          longTermMemory: [`Created: ${new Date().toISOString().split("T")[0]}. ${agent.purpose}`],
          tasksCompleted: 0, successfulOutcomes: 0, failedOutcomes: 0,
          status: "active", version: 1,
        });
        results.agents++;
      }
    }

    // SEED 3: 4 Monitored Campaigns (mirror of IF data)
    const existingCampaigns = await ctx.db.query("monitoredCampaigns").collect();
    if (existingCampaigns.length === 0) {
      const campaigns = [
        { ifCampaignId: "6a6d22ddbb0808d7a7678385", title: "Random tester", status: "active", goalAmount: 1000, raisedAmount: 0, donorCount: 0, outreachEnabled: true, aiTone: "", aiIdealDonors: "", aiInterestedOrgs: "Facebook groups based around charity", aiPlatforms: "", aiPriority: "emotional", storyPresent: true, summary: "", category: "creative", endDate: "", coverImagePresent: true, paymentActive: false },
        { ifCampaignId: "6a6d21b7ae792f66e70f4c5d", title: "Help", status: "active", goalAmount: 5000, raisedAmount: 0, donorCount: 0, outreachEnabled: true, aiTone: "Factual", aiIdealDonors: "", aiInterestedOrgs: "", aiPlatforms: "Facebook", aiPriority: "emotional", storyPresent: true, summary: "", category: "emergency", endDate: "", coverImagePresent: true, paymentActive: false },
        { ifCampaignId: "6a6d189083f8df0b86af5491", title: "Woman with a dream", status: "active", goalAmount: 50000, raisedAmount: 0, donorCount: 0, outreachEnabled: true, aiTone: "Conversational", aiIdealDonors: "Everyone", aiInterestedOrgs: "Im unsure please help with this.", aiPlatforms: "Facebook, Email, Instagram, LinkedIn", aiPriority: "professional", storyPresent: true, summary: "Im seeking help to fund Ai integration for this ai based application and platform.", category: "business", endDate: "2027-01-01", coverImagePresent: true, paymentActive: false },
        { ifCampaignId: "6a6d219983f8df0b86af5492", title: "Help homeless get a conversion van", status: "draft", goalAmount: 10000, raisedAmount: 0, donorCount: 0, outreachEnabled: true, aiTone: "", aiIdealDonors: "", aiInterestedOrgs: "", aiPlatforms: "", aiPriority: "emotional", storyPresent: true, summary: "Housing a homeless person", category: "housing", endDate: "2026-09-30", coverImagePresent: true, paymentActive: false },
      ];

      for (const c of campaigns) {
        await ctx.db.insert("monitoredCampaigns", { ...c, lastSynced: new Date().toISOString() });
        results.campaigns++;
      }
    }

    return {
      status: "success",
      message: "Seed data initialized",
      results,
    };
  },
});
