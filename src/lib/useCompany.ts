"use client";
import { useUser } from "@clerk/nextjs";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCompany() {
  const { user } = useUser();
  const domain = useMemo(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return null;
    const at = email.lastIndexOf("@");
    return at === -1 ? null : email.slice(at + 1).toLowerCase();
  }, [user]);
  const company = useQuery(api.companies.getByDomain, domain ? { domain } : "skip");
  return company;
}


