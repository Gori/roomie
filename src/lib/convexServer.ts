import { ConvexHttpClient } from "convex/browser";

export function getConvexServerClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL!;
  return new ConvexHttpClient(url);
}


