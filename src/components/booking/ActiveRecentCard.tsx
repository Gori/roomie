"use client";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import type { Id } from "../../../convex/_generated/dataModel";

export function ActiveRecentCard({ companyId, userId }: { companyId?: Id<"companies">; userId?: Id<"users"> }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const rangeStart = useMemo(() => now - 15 * 60 * 1000, [now]);
  const rangeEnd = useMemo(() => now + 15 * 60 * 1000, [now]);
  const bookings = useQuery(
    api.bookings.listBookingsByRange,
    companyId ? { companyId, startUTC: rangeStart, endUTC: rangeEnd } : "skip"
  );
  const my = useMemo(() => (bookings ?? []).filter(b => b.userId === userId), [bookings, userId]);
  const target = useMemo(() => {
    if (!my) return null;
    // Prefer active, else most recent ended within 15m
    const active = my.find(b => b.startUTC <= now && now < b.endUTC);
    if (active) return active;
    const recent = [...my].filter(b => b.endUTC <= now).sort((a, b) => b.endUTC - a.endUTC)[0];
    return recent ?? null;
  }, [my, now]);

  const extend = useMutation(api.bookings.extendBooking);
  const shrink = useMutation(api.bookings.shrinkBooking);

  const canShrink = !!target && target.endUTC - target.startUTC >= 15 * 60 * 1000;

  // Naive conflict check for extend: look for other bookings overlapping proposed extension
  const extensionConflicts = useMemo(() => {
    if (!target || !bookings) return false;
    const newEnd = target.endUTC + 15 * 60 * 1000;
    return bookings.some(b => b.roomId === target.roomId && b._id !== target._id && b.startUTC < newEnd && b.endUTC > target.endUTC);
  }, [target, bookings]);

  if (!target) return null;

  return (
    <div className="border rounded p-3 space-y-2 max-w-md">
      <div className="text-sm font-medium">{target.title}</div>
      <div className="flex gap-2">
        <Button variant="outline" disabled={extensionConflicts} onClick={() => extend({ bookingId: target._id, deltaMinutes: 15 })}>Extend +15m</Button>
        <Button variant="outline" disabled={!canShrink} onClick={() => shrink({ bookingId: target._id, deltaMinutes: 15 })}>Shrink −15m</Button>
      </div>
    </div>
  );
}


