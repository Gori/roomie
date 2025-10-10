import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTheme = mutation({
  args: { companyId: v.id("companies"), name: v.string(), seed: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("themes", {
      companyId: args.companyId,
      name: args.name,
      seed: args.seed,
      createdAt: Date.now(),
    });
  },
});

export const listThemesByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, { companyId }) => {
    return await ctx.db
      .query("themes")
      .withIndex("by_company", q => q.eq("companyId", companyId))
      .collect();
  },
});


