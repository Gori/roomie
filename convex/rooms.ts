import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { hasRoleAtLeast } from "./roles";

export const listRooms = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, { companyId }) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_company", q => q.eq("companyId", companyId))
      .collect();
  },
});

export const createRoom = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    size: v.number(),
    imageUrl: v.string(),
    maxBookingMinutes: v.number(),
    location: v.object({
      building: v.string(),
      floor: v.union(v.string(), v.number()),
      code: v.optional(v.string()),
    }),
    equipment: v.array(v.string()),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || !hasRoleAtLeast(actor.role as any, "admin")) throw new Error("forbidden");
    const id = await ctx.db.insert("rooms", {
      companyId: args.companyId,
      name: args.name,
      size: args.size,
      imageUrl: args.imageUrl,
      maxBookingMinutes: args.maxBookingMinutes,
      location: args.location,
      equipment: args.equipment,
    });
    return id;
  },
});

export const updateRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    patch: v.object({
      name: v.optional(v.string()),
      size: v.optional(v.number()),
      imageUrl: v.optional(v.string()),
      maxBookingMinutes: v.optional(v.number()),
      location: v.optional(
        v.object({
          building: v.string(),
          floor: v.union(v.string(), v.number()),
          code: v.optional(v.string()),
        })
      ),
      equipment: v.optional(v.array(v.string())),
    }),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, { roomId, patch, actorUserId }) => {
    const actor = await ctx.db.get(actorUserId);
    if (!actor || !hasRoleAtLeast(actor.role as any, "admin")) throw new Error("forbidden");
    await ctx.db.patch(roomId, patch);
    return roomId;
  },
});


