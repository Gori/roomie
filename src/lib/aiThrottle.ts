"use server";
import { getConvexServerClient } from "@/lib/convexServer";
import { api } from "../../convex/_generated/api";

export async function checkAiQuota(email: string, kind: "text" | "image", dailyLimit = 50) {
  const convex = getConvexServerClient();
  await convex.mutation(api.aiThrottle.checkAndIncrement, { email, kind, dailyLimit });
}


