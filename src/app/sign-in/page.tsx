"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SignIn, SignedIn, SignedOut, UserButton, SignOutButton } from "@clerk/nextjs";

function SignInContent() {
  const params = useSearchParams();
  const blocked = params.get("blocked");

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        {blocked && (
          <div className="rounded border border-red-300/50 bg-red-50 text-red-800 p-3 text-sm">
            Sign-in is not allowed for public email domains. Use a company email.
          </div>
        )}
        <SignedOut>
          <SignIn routing="hash" appearance={{ elements: { card: "shadow-none" } }} />
        </SignedOut>
        <SignedIn>
          {blocked ? (
            <div className="space-y-4 rounded border p-4">
              <p className="text-sm">You&apos;re signed in, but access is blocked for your domain.</p>
              <div className="flex items-center justify-between">
                <UserButton afterSignOutUrl="/sign-in" />
                <SignOutButton signOutOptions={{ redirectUrl: "/sign-in" }}>
                  <button className="text-xs underline text-gray-600">Sign out</button>
                </SignOutButton>
              </div>
            </div>
          ) : (
            <AutoToHome />
          )}
        </SignedIn>
      </div>
    </div>
  );
}

export default function SignInInfoPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div>Loading...</div></div>}>
      <SignInContent />
    </Suspense>
  );
}

function AutoToHome() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}


