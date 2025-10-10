import { startOfWeek, addDays, addMinutes, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { SLOT_MINUTES } from "./time";

export const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
export const SLOTS_PER_DAY = 24 * SLOTS_PER_HOUR;

export function getWeekStart(date: Date, tz: string): Date {
  const zonedDate = toZonedTime(date, tz);
  return startOfWeek(zonedDate, { weekStartsOn: 1 }); // Monday
}

export function getDaySlots(startDate: Date, tz: string): Date[] {
  const slots: Date[] = [];
  let current = toZonedTime(startDate, tz);
  for (let i = 0; i < SLOTS_PER_DAY; i++) {
    slots.push(current);
    current = addMinutes(current, SLOT_MINUTES);
  }
  return slots;
}

export function getWeekSlots(startDate: Date, tz: string): Date[] {
  const slots: Date[] = [];
  for (let day = 0; day < 7; day++) {
    const dayStart = addDays(startDate, day);
    slots.push(...getDaySlots(dayStart, tz));
  }
  return slots;
}

export function isOutsideBusinessHours(date: Date, startHour: number, endHour: number): boolean {
  const hour = date.getHours();
  return hour < startHour || hour >= endHour;
}

export function formatTimeLabel(date: Date): string {
  return format(date, "HH:mm");
}

export function formatDateLabel(date: Date): string {
  return format(date, "EEE d");
}

