import { addMinutes, startOfMinute } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export type BusinessHours = { startHour: number; endHour: number };

export const SLOT_MINUTES = 15;

export function toUtcMs(date: Date | number, tz: string): number {
  const d = typeof date === "number" ? new Date(date) : date;
  const utc = fromZonedTime(d, tz);
  return utc.getTime();
}

export function fromUtcMs(utcMs: number, tz: string): Date {
  return toZonedTime(new Date(utcMs), tz);
}

export function floorToSlot(date: Date, slotMinutes = SLOT_MINUTES): Date {
  const atMinute = startOfMinute(date);
  const minutes = atMinute.getMinutes();
  const floored = minutes - (minutes % slotMinutes);
  const res = new Date(atMinute);
  res.setMinutes(floored, 0, 0);
  return res;
}

export function ceilToSlot(date: Date, slotMinutes = SLOT_MINUTES): Date {
  const floored = floorToSlot(date, slotMinutes);
  if (floored.getTime() === startOfMinute(date).getTime()) return floored;
  return addMinutes(floored, slotMinutes);
}

export function nextSlotStart(from: Date, slotMinutes = SLOT_MINUTES): Date {
  const at = startOfMinute(from);
  const floored = floorToSlot(at, slotMinutes);
  if (floored.getTime() === at.getTime()) return floored;
  return addMinutes(floored, slotMinutes);
}

export function isWithinBusinessHours(
  dateUtcMs: number,
  tz: string,
  hours: BusinessHours
): boolean {
  const local = fromUtcMs(dateUtcMs, tz);
  const h = local.getHours();
  return h >= hours.startHour && h < hours.endHour;
}


