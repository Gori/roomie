"use client";
import { useMemo } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getWeekStart, isOutsideBusinessHours } from "@/lib/calendar";
import { SLOT_MINUTES } from "@/lib/time";
import type { Id } from "../../../convex/_generated/dataModel";
import type { ReactElement } from "react";

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

interface CalendarWeekViewProps {
  rooms: Room[];
  bookings: Booking[];
  tz: string;
  businessHours: { startHour: number; endHour: number };
  onCellClick: (roomId: Id<"rooms">, startUTC: number, endUTC: number) => void;
}

export function CalendarWeekView({ rooms, bookings, tz, businessHours, onCellClick }: CalendarWeekViewProps) {
  const now = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => getWeekStart(now, tz), [now, tz]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [weekStart]);

  const slotsPerHour = 60 / SLOT_MINUTES;

  const groupedRooms = useMemo(() => {
    const groups: Record<string, Room[]> = {};
    rooms.forEach(room => {
      const key = `${room.location.building} • Floor ${room.location.floor}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(room);
    });
    return groups;
  }, [rooms]);

  function getBookingsForCell(roomId: Id<"rooms">, startUTC: number, endUTC: number): Booking[] {
    return bookings.filter(b => 
      b.roomId === roomId && 
      b.startUTC < endUTC && 
      b.endUTC > startUTC
    );
  }

  return (
    <div className="overflow-auto">
      <div className="inline-block min-w-full">
        <div className="flex">
          <div className="w-40 flex-shrink-0 sticky left-0 bg-white z-10 border-r">
            <div className="h-10 border-b" />
            {Object.entries(groupedRooms).map(([group, groupRooms]) => (
              <div key={group}>
                <div className="h-8 px-3 py-1 bg-gray-50 border-b text-xs font-medium text-gray-600">
                  {group}
                </div>
                {groupRooms.map(room => (
                  <div key={room._id} className="h-16 px-3 py-2 border-b flex items-center">
                    <div>
                      <div className="text-sm font-medium">{room.name}</div>
                      <div className="text-xs text-gray-500">
                        {room.size} people
                        {room.location.code && ` • ${room.location.code}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex-1">
            <div className="flex h-10 border-b">
              {days.map(day => (
                <div key={day.toISOString()} className="flex-1 min-w-[120px] text-center py-2 text-sm font-medium border-r">
                  {format(day, "EEE d")}
                </div>
              ))}
            </div>

            {Object.entries(groupedRooms).map(([group, groupRooms]) => (
              <div key={group}>
                <div className="h-8 border-b bg-gray-50" />
                {groupRooms.map(room => (
                  <div key={room._id} className="flex h-16 border-b">
                    {days.map(day => {
                      const daySlots: ReactElement[] = [];
                      for (let hour = 0; hour < 24; hour++) {
                        for (let slot = 0; slot < slotsPerHour; slot++) {
                          const slotDate = new Date(day);
                          slotDate.setHours(hour, slot * SLOT_MINUTES, 0, 0);
                          const zonedSlot = toZonedTime(slotDate, tz);
                          const startUTC = zonedSlot.getTime();
                          const endUTC = startUTC + SLOT_MINUTES * 60 * 1000;
                          const isOutside = isOutsideBusinessHours(zonedSlot, businessHours.startHour, businessHours.endHour);
                          const cellBookings = getBookingsForCell(room._id, startUTC, endUTC);
                          const hasBooking = cellBookings.length > 0;

                          daySlots.push(
                            <button
                              key={`${hour}-${slot}`}
                              onClick={() => !hasBooking && onCellClick(room._id, startUTC, endUTC)}
                              className={`flex-1 min-w-[4px] border-r border-gray-100 hover:bg-blue-50 transition-colors ${
                                isOutside ? "bg-gray-50" : ""
                              } ${hasBooking ? "bg-blue-200 cursor-not-allowed" : ""}`}
                              disabled={hasBooking}
                              title={hasBooking ? cellBookings[0].title : `Book ${room.name}`}
                            />
                          );
                        }
                      }
                      return (
                        <div key={day.toISOString()} className="flex-1 min-w-[120px] flex border-r">
                          {daySlots}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

