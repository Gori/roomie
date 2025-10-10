import { mutation } from "./_generated/server";
import { v } from "convex/values";

function ymd(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const checkAndIncrement = mutation({
  args: { email: v.string(), kind: v.union(v.literal("text"), v.literal("image")), dailyLimit: v.number() },
  handler: async (ctx, { email, kind, dailyLimit }) => {
    const day = ymd();
    const existing = await ctx.db
      .query("aiUsage")
      .withIndex("by_email_day", q => q.eq("email", email).eq("day", day))
      .unique();
    const textCount = existing?.textCount ?? 0;
    const imageCount = existing?.imageCount ?? 0;
    const nextText = kind === "text" ? textCount + 1 : textCount;
    const nextImage = kind === "image" ? imageCount + 1 : imageCount;
    if ((kind === "text" && nextText > dailyLimit) || (kind === "image" && nextImage > dailyLimit)) {
      throw new Error("ai-throttle");
    }
    if (existing) {
      await ctx.db.patch(existing._id, { textCount: nextText, imageCount: nextImage });
      return existing._id;
    }
    return await ctx.db.insert("aiUsage", { email, day, textCount: nextText, imageCount: nextImage });
  },
});


