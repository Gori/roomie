"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { suggestMeetingTitle } from "@/app/actions";
import type { Id } from "../../../convex/_generated/dataModel";

export function CreateBookingModal({
  open,
  onOpenChange,
  defaultRoomId,
  defaultStartUTC,
  defaultEndUTC,
  companyId,
  userId,
  initialTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultRoomId: Id<"rooms"> | null;
  defaultStartUTC: number | null;
  defaultEndUTC: number | null;
  companyId: Id<"companies"> | undefined;
  userId: Id<"users"> | undefined;
  initialTitle?: string;
}) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [startUTC, setStartUTC] = useState<number | null>(defaultStartUTC);
  const [endUTC, setEndUTC] = useState<number | null>(defaultEndUTC);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  const create = useMutation(api.bookings.createBooking);
  const room = useQuery(api.rooms.listRooms, companyId ? { companyId } : "skip");
  
  const selectedRoom = room?.find(r => r._id === defaultRoomId);

  useEffect(() => {
    setStartUTC(defaultStartUTC);
    setEndUTC(defaultEndUTC);
    setTitle(initialTitle ?? "");
    setRepeatWeekly(false);
    setRepeatUntil("");
    setError("");
  }, [defaultStartUTC, defaultEndUTC, initialTitle, open]);

  async function onSuggestTitle() {
    if (!selectedRoom) return;
    setLoading(true);
    try {
      const suggestion = await suggestMeetingTitle(`Meeting in ${selectedRoom.name}, capacity ${selectedRoom.size}`);
      setTitle(suggestion);
    } catch {
      setTitle("Team Meeting");
    } finally {
      setLoading(false);
    }
  }

  async function onCreate() {
    if (!companyId || !userId || !defaultRoomId || !startUTC || !endUTC || !title) return;
    setLoading(true);
    setError("");
    try {
      await create({ 
        companyId, 
        roomId: defaultRoomId, 
        userId, 
        title, 
        startUTC, 
        endUTC,
        repeat: repeatWeekly ? { 
          weekly: true, 
          until: repeatUntil ? new Date(repeatUntil).getTime() : undefined 
        } : undefined
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  function adjustDuration(minutes: number) {
    if (!startUTC) return;
    setEndUTC(startUTC + minutes * 60000);
  }

  const durationMinutes = startUTC && endUTC ? Math.round((endUTC - startUTC) / 60000) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Create Booking</h3>
          {selectedRoom && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedRoom.name} • {selectedRoom.size} people
              {selectedRoom.location.code && ` • ${selectedRoom.location.code}`}
            </p>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Meeting Title</label>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter meeting title" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={onSuggestTitle} disabled={loading}>
              Suggest
            </Button>
          </div>
        </div>

        {startUTC && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Time</label>
            <div className="text-sm text-gray-700">
              {format(new Date(startUTC), "EEE, MMM d • HH:mm")} - {endUTC && format(new Date(endUTC), "HH:mm")}
              <span className="text-gray-500 ml-2">({durationMinutes} min)</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Duration</label>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => adjustDuration(15)}>15m</Button>
            <Button variant="outline" size="sm" onClick={() => adjustDuration(30)}>30m</Button>
            <Button variant="outline" size="sm" onClick={() => adjustDuration(45)}>45m</Button>
            <Button variant="outline" size="sm" onClick={() => adjustDuration(60)}>60m</Button>
            <Button variant="outline" size="sm" onClick={() => adjustDuration(90)}>90m</Button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={repeatWeekly}
              onChange={e => setRepeatWeekly(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-medium">Repeat weekly</span>
          </label>
          {repeatWeekly && (
            <div className="ml-6 space-y-2">
              <label className="text-sm text-gray-600">Until (optional)</label>
              <Input
                type="date"
                value={repeatUntil}
                onChange={e => setRepeatUntil(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={loading || !title}>
            {loading ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}


