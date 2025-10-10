"use server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { uploadPublicPng } from "@/lib/blob";
import { checkAiQuota } from "@/lib/aiThrottle";

export async function suggestRoomNames(theme: string): Promise<string[]> {
  const email = process.env.CLERK_TEST_EMAIL ?? "test@example.com";
  await checkAiQuota(email, "text");
  const { text } = await generateText({
    model: openai("gpt-5-mini"),
    prompt: `Suggest 7 concise meeting room names that fit the theme "${theme}". Respond with a JSON array of strings.`,
  });
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.slice(0, 7).map(String);
  } catch {}
  return [];
}

export async function generateRoomImage(args: { theme: string; roomName: string; seed?: string }) {
  const email = process.env.CLERK_TEST_EMAIL ?? "test@example.com";
  await checkAiQuota(email, "image");
  const artBrief = "The illustration should be flat, minimal, and modern with clean geometric shapes, soft pastel colors, and subtle gradients. It should convey a playful yet polished aesthetic with a cohesive composition and friendly visual tone.";
  const prompt = `${args.theme} — ${args.roomName}. ${artBrief}`;
  
  const result = await generateText({
    model: google("gemini-2.5-flash-image"),
    providerOptions: {
      google: { responseModalities: ["TEXT", "IMAGE"] },
    },
    prompt,
  });

  const imageFile = result.files.find(file => file.mediaType.startsWith("image/"));
  if (!imageFile) throw new Error("No image generated");

  const fileName = `rooms/${encodeURIComponent(args.theme)}_${encodeURIComponent(args.roomName)}_${Date.now()}.png`;
  const newArrayBuffer = new ArrayBuffer(imageFile.uint8Array.byteLength);
  new Uint8Array(newArrayBuffer).set(imageFile.uint8Array);
  const url = await uploadPublicPng(fileName, newArrayBuffer);
  return { imageUrl: url };
}


