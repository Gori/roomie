"use client";
import { useMemo, useState } from "react";
import { useCompany } from "@/lib/useCompany";
import { useUserRecord } from "@/lib/useUserRecord";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CreateBookingModal } from "@/components/booking/CreateBookingModal";
import { ActiveRecentCard } from "@/components/booking/ActiveRecentCard";
import type { Id } from "../../../convex/_generated/dataModel";

const SLOT_MS = 15 * 60 * 1000;

export default function HomeClient() {
  const company = useCompany();
  const me = useUserRecord();
  const rooms = useQuery(api.rooms.listRooms, company?._id ? { companyId: company._id } : "skip");
  const [now] = useState(() => Date.now());
  const windowEnd = useMemo(() => now + 8 * 60 * 60 * 1000, [now]);
  const bookings = useQuery(
    api.bookings.listBookingsByRange,
    company?._id ? { companyId: company._id, startUTC: now, endUTC: windowEnd } : "skip"
  );

  const [modal, setModal] = useState<{ open: boolean; roomId: Id<"rooms"> | null; startUTC: number | null; endUTC: number | null; title?: string }>({ open: false, roomId: null, startUTC: null, endUTC: null });

  function findNextAvailable(size: number) {
    if (!rooms) return null;
    const candidates = rooms.filter(r => r.size >= size);
    if (!candidates.length) return null;
    const roomIdToBusy: Record<string, Array<{ s: number; e: number }>> = {};
    for (const r of candidates) roomIdToBusy[r._id] = [];
    for (const b of bookings ?? []) {
      if (roomIdToBusy[b.roomId]) roomIdToBusy[b.roomId].push({ s: b.startUTC, e: b.endUTC });
    }
    const duration = 30 * 60 * 1000;
    for (let t = now; t < windowEnd; t += SLOT_MS) {
      for (const r of candidates) {
        const slotEnd = t + duration;
        const conflicts = roomIdToBusy[r._id].some(x => x.s < slotEnd && x.e > t);
        if (!conflicts) return { roomId: r._id, startUTC: t, endUTC: slotEnd };
      }
    }
    return null;
  }

  async function openQuick(size: number) {
    const slot = findNextAvailable(size);
    if (!slot) return;
    setModal({ open: true, roomId: slot.roomId, startUTC: slot.startUTC, endUTC: slot.endUTC, title: undefined });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 max-w-md">
        {[2, 4, 8].map(s => (
          <button
            key={s}
            onClick={() => openQuick(s)}
            className="flex flex-col items-center justify-center p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-3xl font-medium">{s}</span>
            <span className="text-sm text-gray-600 mt-1">people</span>
          </button>
        ))}
      </div>
      <ActiveRecentCard companyId={company?._id} userId={me?._id} />
      <CreateBookingModal
        open={modal.open}
        onOpenChange={v => setModal(m => ({ ...m, open: v }))}
        defaultRoomId={modal.roomId}
        defaultStartUTC={modal.startUTC}
        defaultEndUTC={modal.endUTC}
        companyId={company?._id}
        userId={me?._id}
        initialTitle={modal.title}
      />
    </div>
  );
}


