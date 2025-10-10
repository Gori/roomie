"use client";
import { useCompany } from "@/lib/useCompany";
import { useUserRecord } from "@/lib/useUserRecord";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const company = useCompany();
  const me = useUserRecord();
  const users = useQuery(api.users.listByCompany, company?._id ? { companyId: company._id } : "skip");
  const removeUser = useMutation(api.users.removeUser);
  const transfer = useMutation(api.companies.transferOwnership);

  if (!company || !me) return null;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-medium">People & Permissions</h1>
      <div className="space-y-2">
        {users?.map(u => (
          <div key={u._id} className="flex items-center justify-between border rounded p-2">
            <div className="text-sm">{u.name ?? u.email} — {u.role}</div>
            <div className="flex gap-2">
              {me.role === "owner" && me._id !== u._id && (
                <Button variant="outline" onClick={() => transfer({ actorUserId: me._id, targetUserId: u._id })}>Transfer ownership</Button>
              )}
              {(me.role === "owner" || me.role === "admin") && me._id !== u._id && (
                <Button variant="outline" onClick={() => removeUser({ actorUserId: me._id, targetUserId: u._id })}>Remove</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


