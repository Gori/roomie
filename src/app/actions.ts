"use server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { checkAiQuota } from "@/lib/aiThrottle";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function suggestMeetingTitle(context: string): Promise<string> {
  const email = process.env.CLERK_TEST_EMAIL ?? "test@example.com";
  await checkAiQuota(email, "text");
  const { text } = await generateText({
    model: openai("gpt-5-mini"),
    prompt: `Suggest a short, conventional meeting title based on this context: ${context}. Respond with only the title.`,
  });
  return text.trim().slice(0, 80);
}


