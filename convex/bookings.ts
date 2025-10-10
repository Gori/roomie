import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

export const createBooking = mutation({
  args: {
    companyId: v.id("companies"),
    roomId: v.id("rooms"),
    userId: v.id("users"),
    title: v.string(),
    startUTC: v.number(),
    endUTC: v.number(),
    repeat: v.optional(v.object({ weekly: v.literal(true), until: v.optional(v.number()) })),
  },
  handler: async (ctx, args) => {
    if (args.endUTC <= args.startUTC) throw new Error("invalid-range");
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("room-not-found");
    const durationMinutes = Math.ceil((args.endUTC - args.startUTC) / 60000);
    if (durationMinutes > room.maxBookingMinutes) throw new Error("duration-exceeds-limit");

    const conflict = await ctx.db
      .query("bookings")
      .withIndex("by_room_time", q => q.eq("roomId", args.roomId))
      .filter(q => q.lt(q.field("startUTC"), args.endUTC) && q.gt(q.field("endUTC"), args.startUTC))
      .first();
    if (conflict) throw new Error("conflict");

    const id = await ctx.db.insert("bookings", {
      companyId: args.companyId,
      roomId: args.roomId,
      userId: args.userId,
      title: args.title,
      startUTC: args.startUTC,
      endUTC: args.endUTC,
      repeat: args.repeat,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    actorUserId: v.id("users"),
    actorRole: v.union(v.literal("user"), v.literal("admin"), v.literal("owner")),
  },
  handler: async (ctx, { bookingId, actorUserId, actorRole }) => {
    const booking = await ctx.db.get(bookingId);
    if (!booking) throw new Error("not-found");
    if (actorRole === "user" && booking.userId !== actorUserId) throw new Error("forbidden");
    await ctx.db.delete(bookingId);
    return bookingId;
  },
});

export const extendBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    deltaMinutes: v.number(),
  },
  handler: async (ctx, { bookingId, deltaMinutes }) => {
    if (deltaMinutes <= 0) throw new Error("invalid-delta");
    const booking = await ctx.db.get(bookingId);
    if (!booking) throw new Error("not-found");
    const room = await ctx.db.get(booking.roomId);
    if (!room) throw new Error("room-not-found");
    const newEnd = booking.endUTC + deltaMinutes * 60000;
    const newDuration = Math.ceil((newEnd - booking.startUTC) / 60000);
    if (newDuration > room.maxBookingMinutes) throw new Error("duration-exceeds-limit");
    const conflict = await ctx.db
      .query("bookings")
      .withIndex("by_room_time", q => q.eq("roomId", booking.roomId))
      .filter(q => q.neq(q.field("_id"), bookingId) && q.lt(q.field("startUTC"), newEnd) && q.gt(q.field("endUTC"), booking.startUTC))
      .first();
    if (conflict) throw new Error("conflict");
    await ctx.db.patch(bookingId, { endUTC: newEnd });
    return bookingId;
  },
});

export const shrinkBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    deltaMinutes: v.number(),
  },
  handler: async (ctx, { bookingId, deltaMinutes }) => {
    if (deltaMinutes <= 0) throw new Error("invalid-delta");
    const booking = await ctx.db.get(bookingId);
    if (!booking) throw new Error("not-found");
    const newEnd = booking.endUTC - deltaMinutes * 60000;
    if (newEnd <= booking.startUTC) throw new Error("invalid-range");
    await ctx.db.patch(bookingId, { endUTC: newEnd });
    return bookingId;
  },
});

export const listBookingsByRange = query({
  args: {
    companyId: v.id("companies"),
    startUTC: v.number(),
    endUTC: v.number(),
  },
  handler: async (ctx, { companyId, startUTC, endUTC }) => {
    if (endUTC <= startUTC) return [];
    const results = await ctx.db
      .query("bookings")
      .withIndex("by_company_time", q => q.eq("companyId", companyId))
      .filter(q => q.lt(q.field("startUTC"), endUTC) && q.gt(q.field("endUTC"), startUTC))
      .collect();
    return results;
  },
});


