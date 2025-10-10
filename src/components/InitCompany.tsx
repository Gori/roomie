"use client";
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isPublicDomain } from "@/lib/publicDomains";

export default function InitCompany() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const bootstrap = useMutation(api.companies.bootstrapCompanyIfFirst);
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    async function run() {
      if (!isSignedIn || !user) return;
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;
      const domain = email.slice(email.lastIndexOf("@") + 1).toLowerCase();
      if (isPublicDomain(domain)) return;
      const companyId = await bootstrap({
        domain,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        businessHours: { startHour: 9, endHour: 18 },
      });
      await ensureUser({
        companyId,
        email,
        name: user.fullName ?? undefined,
        profileImage: user.imageUrl ?? undefined,
        role: "user",
      });
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user]);

  return null;
}


