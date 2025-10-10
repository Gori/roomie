"use client";
import { useMemo } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getWeekStart, isOutsideBusinessHours } from "@/lib/calendar";
import { SLOT_MINUTES } from "@/lib/time";
import type { Id } from "../../../convex/_generated/dataModel";

interface Room {
  _id: Id<"rooms">;
  name: string;
  size: number;
  location: { building: string; floor: string | number; code?: string };
}

interface Booking {
  _id: Id<"bookings">;
  roomId: Id<"rooms">;
  title: string;
  startUTC: number;
  endUTC: number;
}

interface CalendarDayViewProps {
  rooms: Room[];
  bookings: Booking[];
  tz: string;
  businessHours: { startHour: number; endHour: number };
  selectedDay: number;
  onDayChange: (day: number) => void;
  onCellClick: (roomId: Id<"rooms">, startUTC: number, endUTC: number) => void;
}

export function CalendarDayView({ rooms, bookings, tz, businessHours, selectedDay, onDayChange, onCellClick }: CalendarDayViewProps) {
  const now = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => getWeekStart(now, tz), [now, tz]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return { index: i, date, label: format(date, "EEE d") };
    });
  }, [weekStart]);

  const currentDay = useMemo(() => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + selectedDay);
    return date;
  }, [weekStart, selectedDay]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const slotsPerHour = 60 / SLOT_MINUTES;

  function getBookingsForCell(roomId: Id<"rooms">, startUTC: number, endUTC: number): Booking[] {
    return bookings.filter(b => 
      b.roomId === roomId && 
      b.startUTC < endUTC && 
      b.endUTC > startUTC
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 bg-white z-20 border-b">
        <div className="flex gap-1 p-2 overflow-x-auto">
          {days.map(day => (
            <button
              key={day.index}
              onClick={() => onDayChange(day.index)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedDay === day.index
                  ? "bg-blue-500 text-white font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex">
          <div className="w-16 flex-shrink-0 sticky left-0 bg-white z-10 border-r">
            {hours.map(hour => (
              <div key={hour} className="h-20 border-b flex items-center justify-center text-xs text-gray-500">
                {hour.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          <div className="flex-1">
            {hours.map(hour => (
              <div key={hour} className="flex h-20 border-b">
                <div className="flex-1 flex flex-col">
                  {Array.from({ length: slotsPerHour }).map((_, slotIdx) => {
                    const slotDate = new Date(currentDay);
                    slotDate.setHours(hour, slotIdx * SLOT_MINUTES, 0, 0);
                    const zonedSlot = toZonedTime(slotDate, tz);
                    const startUTC = zonedSlot.getTime();
                    const endUTC = startUTC + SLOT_MINUTES * 60 * 1000;
                    const isOutside = isOutsideBusinessHours(zonedSlot, businessHours.startHour, businessHours.endHour);

                    return (
                      <div key={slotIdx} className={`flex-1 flex border-t ${isOutside ? "bg-gray-50" : ""}`}>
                        {rooms.map(room => {
                          const cellBookings = getBookingsForCell(room._id, startUTC, endUTC);
                          const hasBooking = cellBookings.length > 0;
                          return (
                            <button
                              key={room._id}
                              onClick={() => !hasBooking && onCellClick(room._id, startUTC, endUTC)}
                              className={`flex-1 border-r hover:bg-blue-50 transition-colors ${
                                hasBooking ? "bg-blue-200" : ""
                              }`}
                              disabled={hasBooking}
                              title={hasBooking ? cellBookings[0].title : `Book ${room.name}`}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

