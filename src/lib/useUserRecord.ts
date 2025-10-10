"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUserRecord() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const record = useQuery(api.users.getByEmail, email ? { email } : "skip");
  return record;
}


