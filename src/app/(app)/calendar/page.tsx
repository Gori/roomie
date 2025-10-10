"use client";
import { useMemo, useState } from "react";
import { useCompany } from "@/lib/useCompany";
import { useUserRecord } from "@/lib/useUserRecord";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CreateBookingModal } from "@/components/booking/CreateBookingModal";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CalendarDayView } from "@/components/calendar/CalendarDayView";
import { getWeekStart } from "@/lib/calendar";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function CalendarPage() {
  const company = useCompany();
  const me = useUserRecord();
  const rooms = useQuery(api.rooms.listRooms, company?._id ? { companyId: company._id } : "skip");
  
  const now = useMemo(() => new Date(), []);
  const tz = company?.tz || "UTC";
  const weekStart = useMemo(() => getWeekStart(now, tz), [now, tz]);
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    return end;
  }, [weekStart]);

  const bookings = useQuery(
    api.bookings.listBookingsByRange,
    company?._id ? { 
      companyId: company._id, 
      startUTC: weekStart.getTime(), 
      endUTC: weekEnd.getTime() 
    } : "skip"
  );

  const [view, setView] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(0);
  const [modal, setModal] = useState<{ 
    open: boolean; 
    roomId: Id<"rooms"> | null; 
    startUTC: number | null; 
    endUTC: number | null;
  }>({ open: false, roomId: null, startUTC: null, endUTC: null });

  function handleCellClick(roomId: Id<"rooms">, startUTC: number, endUTC: number) {
    setModal({ open: true, roomId, startUTC, endUTC });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="p-4 border-b flex gap-4 items-center">
        <h1 className="text-xl font-medium">Calendar</h1>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              view === "week"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("day")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              view === "day"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Day
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "week" && rooms && bookings && company ? (
          <CalendarWeekView
            rooms={rooms}
            bookings={bookings}
            tz={tz}
            businessHours={company.businessHours}
            onCellClick={handleCellClick}
          />
        ) : view === "day" && rooms && bookings && company ? (
          <CalendarDayView
            rooms={rooms}
            bookings={bookings}
            tz={tz}
            businessHours={company.businessHours}
            selectedDay={selectedDay}
            onDayChange={setSelectedDay}
            onCellClick={handleCellClick}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading calendar...
          </div>
        )}
      </div>

      <CreateBookingModal
        open={modal.open}
        onOpenChange={v => setModal(m => ({ ...m, open: v }))}
        defaultRoomId={modal.roomId}
        defaultStartUTC={modal.startUTC}
        defaultEndUTC={modal.endUTC}
        companyId={company?._id}
        userId={me?._id}
      />
    </div>
  );
}


