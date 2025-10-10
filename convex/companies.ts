import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { isPublicDomain } from "./publicDomains";

export const getByDomain = query({
  args: { domain: v.string() },
  handler: async (ctx, { domain }) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_domain", q => q.eq("domain", domain))
      .unique();
  },
});

export const bootstrapCompanyIfFirst = mutation({
  args: {
    domain: v.string(),
    tz: v.string(),
    businessHours: v.object({ startHour: v.number(), endHour: v.number() }),
  },
  handler: async (ctx, { domain, tz, businessHours }) => {
    if (isPublicDomain(domain)) throw new Error("public-domain-blocked");
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_domain", q => q.eq("domain", domain))
      .unique();
    if (existing) return existing._id;
    const companyId = await ctx.db.insert("companies", {
      domain,
      tz,
      businessHours,
      createdBy: undefined,
      createdAt: Date.now(),
    });
    return companyId;
  },
});

export const updateCompanySettings = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.optional(v.string()),
    tz: v.optional(v.string()),
    businessHours: v.optional(
      v.object({ startHour: v.number(), endHour: v.number() })
    ),
  },
  handler: async (ctx, { companyId, name, tz, businessHours }) => {
    const company = await ctx.db.get(companyId);
    if (!company) throw new Error("not-found");
    await ctx.db.patch(companyId, {
      ...(name ? { name } : {}),
      ...(tz ? { tz } : {}),
      ...(businessHours ? { businessHours } : {}),
    });
    return companyId;
  },
});

export const transferOwnership = mutation({
  args: { actorUserId: v.id("users"), targetUserId: v.id("users") },
  handler: async (ctx, { actorUserId, targetUserId }) => {
    if (actorUserId === targetUserId) throw new Error("no-op");
    const actor = await ctx.db.get(actorUserId);
    const target = await ctx.db.get(targetUserId);
    if (!actor || !target) throw new Error("not-found");
    if (actor.companyId !== target.companyId) throw new Error("forbidden");
    if (actor.role !== "owner") throw new Error("forbidden");
    await ctx.db.patch(actorUserId, { role: "admin" });
    await ctx.db.patch(targetUserId, { role: "owner" });
    return targetUserId;
  },
});


