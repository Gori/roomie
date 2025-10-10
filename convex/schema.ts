import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  companies: defineTable({
    domain: v.string(),
    name: v.optional(v.string()),
    tz: v.string(),
    businessHours: v.object({ startHour: v.number(), endHour: v.number() }),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_domain", ["domain"]),

  users: defineTable({
    companyId: v.id("companies"),
    email: v.string(),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    status: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("owner")),
  })
    .index("by_company", ["companyId"])
    .index("by_email", ["email"]),

  themes: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    seed: v.string(),
    createdAt: v.number(),
  }).index("by_company", ["companyId"]),

  rooms: defineTable({
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
  }).index("by_company", ["companyId"]),

  bookings: defineTable({
    companyId: v.id("companies"),
    roomId: v.id("rooms"),
    userId: v.id("users"),
    title: v.string(),
    startUTC: v.number(),
    endUTC: v.number(),
    repeat: v.optional(
      v.object({ weekly: v.literal(true), until: v.optional(v.number()) })
    ),
    createdAt: v.number(),
  })
    .index("by_company_time", ["companyId", "startUTC"])
    .index("by_room_time", ["roomId", "startUTC"]),

  aiUsage: defineTable({
    email: v.string(),
    day: v.string(), // YYYY-MM-DD
    textCount: v.number(),
    imageCount: v.number(),
  }).index("by_email_day", ["email", "day"]),
});


