import { put } from "@vercel/blob";

export async function uploadPublicPng(path: string, bytes: ArrayBuffer) {
  const { url } = await put(path, new Blob([bytes], { type: "image/png" }), {
    access: "public",
  });
  return url;
}


