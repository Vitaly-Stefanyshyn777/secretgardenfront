const KYIV_TZ = "Europe/Kyiv";

/** Кур'єр (Uklon) — лише в години роботи магазину */
export const COURIER_HOURS = {
  startHour: 12,
  startMinute: 0,
  endHour: 20,
  endMinute: 40,
} as const;

export const COURIER_HOURS_LABEL = "12:00–20:40";

function getKyivTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KYIV_TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return { hour, minute };
}

function toMinutes(hour: number, minute: number) {
  return hour * 60 + minute;
}

export function isCourierDeliveryAvailable(now = new Date()): boolean {
  const { hour, minute } = getKyivTimeParts(now);
  const current = toMinutes(hour, minute);
  const start = toMinutes(COURIER_HOURS.startHour, COURIER_HOURS.startMinute);
  const end = toMinutes(COURIER_HOURS.endHour, COURIER_HOURS.endMinute);
  return current >= start && current <= end;
}

export function msUntilNextCourierAvailabilityChange(now = new Date()): number {
  const { hour, minute } = getKyivTimeParts(now);
  const current = toMinutes(hour, minute);
  const start = toMinutes(COURIER_HOURS.startHour, COURIER_HOURS.startMinute);
  const end = toMinutes(COURIER_HOURS.endHour, COURIER_HOURS.endMinute);

  if (current < start) {
    return (start - current) * 60_000;
  }
  if (current <= end) {
    return (end - current + 1) * 60_000;
  }
  // після 20:40 — до 12:00 наступного дня (перевірка кожну хвилину достатня)
  return 60_000;
}
