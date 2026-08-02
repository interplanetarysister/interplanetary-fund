import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // AGENTS — 7 credit-free agent records
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    purpose: v.string(),
    description: v.string(),
    capabilities: v.array(v.string()),
    specialization: v.string(),
    knowledgeAreas: v.array(v.string()),
    trustScore: v.number(),
    reliabilityScore: v.number(),
    efficiencyScore: v.number(),
    collaborationScore: v.number(),
    permissions: v.array(v.string()),
    responsibilities: v.array(v.string()),
    toolsAvailable: v.array(v.string()),
    allowedActions: v.array(v.string()),
    approvalRequired: v.boolean(),
    dataAccessLevel: v.string(),
    limitations: v.array(v.string()),
    restrictedActions: v.array(v.string()),
    workflowAccess: v.array(v.string()),
    workingMemory: v.array(v.string()),
    longTermMemory: v.array(v.string()),
    managedCampaigns: v.array(v.string()),
    tasksCompleted: v.number(),
    successfulOutcomes: v.number(),
    failedOutcomes: v.number(),
    status: v.string(),
    version: v.number(),
    accentColor: v.string(),
  }).index("byRole", ["role"]).index("byStatus", ["status"]),

  // MONITORED CAMPAIGNS — mirror of IF campaign data
  monitoredCampaigns: defineTable({
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
    lastSynced: v.string(),
  }).index("byIfId", ["ifCampaignId"]).index("byStatus", ["status"]),

  // PROTOCOL REPORTS — persistent audit history
  protocolReports: defineTable({
    reportType: v.string(),
    auditDate: v.string(),
    totalCampaigns: v.number(),
    compliantCampaigns: v.number(),
    nonCompliantCampaigns: v.number(),
    totalRaised: v.number(),
    totalGoal: v.number(),
    fundingGap: v.number(),
    totalDonors: v.number(),
    criticalViolations: v.array(v.object({
      standard: v.string(),
      issue: v.string(),
      severity: v.string(),
    })),
    results: v.array(v.object({
      title: v.string(),
      complianceScore: v.number(),
      violations: v.number(),
    })),
    syncPerformed: v.boolean(),
  }).index("byDate", ["auditDate"]),

  // EXTERNAL PLATFORMS — connected external crowdfunding accounts
  externalPlatforms: defineTable({
    userId: v.string(),
    platformName: v.string(),
    campaignUrl: v.string(),
    campaignTitle: v.string(),
    raisedAmount: v.number(),
    goalAmount: v.number(),
    donorCount: v.number(),
    lastSynced: v.string(),
    syncStatus: v.string(),
    connectionType: v.string(),
    authToken: v.optional(v.string()),
  }).index("byUserId", ["userId"]).index("byPlatform", ["platformName"]),

  // HOLDING ACCOUNTS — user fund balances
  holdingAccounts: defineTable({
    userId: v.string(),
    totalBalance: v.number(),
    totalFeesDeducted: v.number(),
    totalPaidOut: v.number(),
    pendingPayouts: v.number(),
    lastUpdated: v.string(),
  }).index("byUserId", ["userId"]),

  // PAYOUT REQUESTS — user cashout requests
  payoutRequests: defineTable({
    userId: v.string(),
    amountRequested: v.number(),
    feeAmount: v.number(),
    netAmount: v.number(),
    payoutMethod: v.string(),
    payoutDestination: v.string(),
    status: v.string(),
    requestedDate: v.string(),
    completedDate: v.optional(v.string()),
    transactionId: v.optional(v.string()),
  }).index("byUserId", ["userId"]).index("byStatus", ["status"]),

  // TRANSACTIONS — all fund movements
  transactions: defineTable({
    userId: v.string(),
    type: v.string(),
    amount: v.number(),
    sourcePlatform: v.optional(v.string()),
    campaignId: v.optional(v.string()),
    payoutRequestId: v.optional(v.string()),
    status: v.string(),
    createdAt: v.string(),
  }).index("byUserId", ["userId"]).index("byType", ["type"]),

  // FEE CONFIGURATION — platform fee settings
  feeConfig: defineTable({
    platformFeePercent: v.number(),
    processingFeePercent: v.number(),
    processingFeeFlat: v.number(),
    active: v.boolean(),
    updatedBy: v.string(),
    updatedAt: v.string(),
  }),
});
