/*
 * Interplanetary Fund — Copyright © 2026 Michelle Rogers. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL. Do not copy, distribute, or modify without
 * express written permission. See LICENSE file for full terms.
 */

import { mutation } from "./_generated/server";

function isPlaceholderOrInvalidUrl(value: string | undefined): boolean {
  const url = (value ?? "").trim();
  if (!url) return true;

  const normalized = url.toLowerCase();
  const knownPlaceholders = new Set([
    "f", "h", "d", "jjj", "test", "testing", "example", "placeholder",
    "todo", "tbd", "n/a", "na", "none", "null", "undefined", "localhost",
  ]);

  if (knownPlaceholders.has(normalized)) return true;
  if (normalized.includes("placeholder") || normalized.includes("example.com")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol !== "http:" && parsed.protocol !== "https:";
  } catch {
    return true;
  }
}

// Invalid/placeholder platform connections are always kept in draft state and
// are never eligible for publishing.
export const cleanupPlaceholderUrls = mutation({
  args: {},
  handler: async (ctx) => {
    const platforms = await ctx.db.query("externalPlatforms").collect();
    const cleaned = [];

    for (const platform of platforms) {
      const url = platform.externalUrl?.trim() ?? "";
      if (isPlaceholderOrInvalidUrl(url)) {
        await ctx.db.patch(platform._id, {
          externalUrl: "",
          status: "draft",
        });
        cleaned.push({
          id: platform._id,
          platform: platform.platformName,
          oldUrl: url,
          status: "draft",
        });
      }
    }

    return {
      status: "success",
      platformsChecked: platforms.length,
      platformsCleaned: cleaned.length,
      details: cleaned,
    };
  },
});

export const fixPlatformStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    const platforms = await ctx.db.query("externalPlatforms").collect();
    const fixed = [];

    for (const platform of platforms) {
      if (isPlaceholderOrInvalidUrl(platform.externalUrl)) {
        await ctx.db.patch(platform._id, { status: "draft" });
        fixed.push({
          platform: platform.platformName,
          campaign: platform.campaignId,
          reason: "Missing, placeholder, or invalid HTTP(S) URL",
        });
      }
    }

    return { status: "success", fixed: fixed.length, details: fixed };
  },
});
