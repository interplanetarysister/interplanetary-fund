/*
 * Interplanetary Fund — Copyright © 2026 Michelle Rogers. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL. Do not copy, distribute, or modify without
 * express written permission. See LICENSE file for full terms.
 *
 * Temporary Admin Access Code
 * Purpose: Provide a non-sensitive, temporary administrator unlock path for
 * internal maintenance and verification without reusing the production PIN.
 *
 * This is intentionally simple and time-limited by repository usage. Rotate or
 * remove after use.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const TEMP_ADMIN_CODE_KEY = "temp_admin_code";

export const getTempAdminAccessCode = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("adminSettings")
      .withIndex("byKey", (q: any) => q.eq("key", TEMP_ADMIN_CODE_KEY))
      .first();

    return setting?.value ?? null;
  },
});

export const initTempAdminAccessCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    if (!code || code.length < 4) {
      throw new Error("Temporary admin code must be at least 4 characters.");
    }

    const existing = await ctx.db
      .query("adminSettings")
      .withIndex("byKey", (q: any) => q.eq("key", TEMP_ADMIN_CODE_KEY))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: code,
        updatedAt: new Date().toISOString(),
      });
      return { status: "updated" };
    }

    await ctx.db.insert("adminSettings", {
      key: TEMP_ADMIN_CODE_KEY,
      value: code,
      updatedAt: new Date().toISOString(),
    });

    return { status: "created" };
  },
});

export const validateTempAdminAccessCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    if (!code || code.length < 4) {
      return { valid: false };
    }

    const setting = await ctx.db
      .query("adminSettings")
      .withIndex("byKey", (q: any) => q.eq("key", TEMP_ADMIN_CODE_KEY))
      .first();

    return {
      valid: setting?.value === code,
    };
  },
});
