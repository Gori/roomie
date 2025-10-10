"use client";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/nextjs";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useMemo } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://example.convex.cloud");

function useAuth() {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: isSignedIn ?? false,
      fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
        return await getToken({ skipCache: forceRefreshToken });
      },
    }),
    [isLoaded, isSignedIn, getToken]
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithAuth>
    </ClerkProvider>
  );
}


