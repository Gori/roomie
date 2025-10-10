"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserRecord } from "@/lib/useUserRecord";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCompany } from "@/lib/useCompany";

export function OnboardingRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const me = useUserRecord();
  const company = useCompany();
  const themes = useQuery(api.themes.listThemesByCompany, company?._id ? { companyId: company._id } : "skip");
  const rooms = useQuery(api.rooms.listRooms, company?._id ? { companyId: company._id } : "skip");

  useEffect(() => {
    if (!me || !company) return;
    
    // First check: owner needs to complete onboarding
    if (pathname !== "/onboarding" && me.role === "owner" && themes?.length === 0) {
      router.push("/onboarding");
      return;
    }
    
    // Second check: owner needs to create at least one room after onboarding
    if (pathname !== "/rooms/new" && me.role === "owner" && themes && themes.length > 0 && rooms?.length === 0) {
      router.push("/rooms/new");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, company, themes, rooms, pathname]);

  return null;
}


