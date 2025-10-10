import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const ensureUser = mutation({
  args: {
    companyId: v.id("companies"),
    email: v.string(),
    name: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("owner")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .unique();
    if (existing) return existing._id;
    // If first user in company, make owner
    const firstOfCompany = await ctx.db
      .query("users")
      .withIndex("by_company", q => q.eq("companyId", args.companyId))
      .first();
    const role = firstOfCompany ? args.role : ("owner" as const);
    return await ctx.db.insert("users", {
      companyId: args.companyId,
      email: args.email,
      name: args.name,
      profileImage: args.profileImage,
      role,
    });
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .unique();
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { userId, ...rest }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("not-found");
    await ctx.db.patch(userId, rest);
    return userId;
  },
});

export const listByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, { companyId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_company", q => q.eq("companyId", companyId))
      .collect();
  },
});

export const removeUser = mutation({
  args: { actorUserId: v.id("users"), targetUserId: v.id("users") },
  handler: async (ctx, { actorUserId, targetUserId }) => {
    if (actorUserId === targetUserId) throw new Error("cannot-remove-self");
    const actor = await ctx.db.get(actorUserId);
    const target = await ctx.db.get(targetUserId);
    if (!actor || !target) throw new Error("not-found");
    if (actor.companyId !== target.companyId) throw new Error("forbidden");
    // Admin can remove users except admins/owners; Owner can remove any user except self
    if (actor.role === "admin" && (target.role === "admin" || target.role === "owner")) {
      throw new Error("forbidden");
    }
    if (actor.role === "user") throw new Error("forbidden");
    await ctx.db.delete(targetUserId);
    return targetUserId;
  },
});


