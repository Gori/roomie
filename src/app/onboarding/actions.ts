"use server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getConvexServerClient } from "@/lib/convexServer";
import { api } from "../../../convex/_generated/api";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function suggestThemes(): Promise<string[]> {
  const email = process.env.CLERK_TEST_EMAIL ?? "test@example.com";
  const convex = getConvexServerClient();
  await convex.mutation(api.aiThrottle.checkAndIncrement, { email, kind: "text", dailyLimit: 50 });
  const prompt = `Suggest 5 creative, fun naming schemes for office meeting rooms. Examples: "European Cities", "Tropical Islands", "Jazz Musicians", "Ancient Wonders", "Precious Gems".
Return only a JSON array of strings.`;
  const { text } = await generateText({
    model: openai("gpt-5-mini"),
    prompt,
  });
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.slice(0, 5).map(String);
  } catch {}
  return [];
}


