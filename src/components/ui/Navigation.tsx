"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserRecord } from "@/lib/useUserRecord";
import { UserButton, useAuth } from "@clerk/nextjs";

export function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const me = useUserRecord();
  const canCreateRooms = me?.role === "admin" || me?.role === "owner";
  const isOnboarding = pathname?.includes("/onboarding");

  if (!isSignedIn || pathname?.startsWith("/sign-in")) {
    return null;
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/calendar", label: "Calendar" },
    ...(canCreateRooms ? [{ href: "/rooms/new", label: "New Room" }] : []),
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {isOnboarding ? (
            <Link href="/" className="font-medium text-lg">
              Roomie
            </Link>
          ) : (
            <div className="flex gap-6">
              <Link href="/" className="font-medium text-lg">
                Roomie
              </Link>
              <div className="flex gap-4 items-center">
                {links.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm ${
                      pathname === link.href
                        ? "text-gray-900 font-medium"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </nav>
  );
}

