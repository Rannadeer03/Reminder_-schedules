import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string, timezone = "UTC"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatTime(date: Date | string, timezone = "UTC"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function minutesUntil(date: Date | string): number {
  const ms = new Date(date).getTime() - Date.now();
  return Math.round(ms / 60000);
}

export function isWithinWindow(
  eventStart: Date,
  targetMinutes: number,
  windowMinutes = 1
): boolean {
  const diff = minutesUntil(eventStart);
  return diff >= targetMinutes - windowMinutes && diff <= targetMinutes + windowMinutes;
}
