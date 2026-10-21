// Between an instant in UTC and the text of a `datetime-local` box, which
// is the member's own clock: `2026-10-20T19:00`. Browser only: both read
// the page's time zone.

/** The instant in an ISO string, as the box's local text; "" if it isn't one. */
export function toLocal(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const pad = (n: number, digits = 2) => String(n).padStart(digits, "0");
  // Four-digit years: the box passes through 0002 as a year is typed.
  const year = pad(at.getFullYear(), 4);
  const date = [year, pad(at.getMonth() + 1), pad(at.getDate())];
  return `${date.join("-")}T${pad(at.getHours())}:${pad(at.getMinutes())}`;
}

/** The box's local text as an ISO string in UTC; undefined while it's empty. */
export function fromLocal(text: string): string | undefined {
  if (!text) return undefined;
  const at = new Date(text);
  return Number.isNaN(at.getTime()) ? undefined : at.toISOString();
}

/** An ISO string in another offset as UTC; anything else as it was given. */
export function toUtc(iso: string): string {
  const at = new Date(iso);
  return Number.isNaN(at.getTime()) ? iso : at.toISOString();
}

/**
 * The zone as people say it, "Eastern Daylight Time", at `at`; its ID where
 * en-US has only an offset for it ("GMT+03:00").
 */
export function zoneName(timeZone: string, at = new Date()): string {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "long",
  })
    .formatToParts(at)
    .find((part) => part.type === "timeZoneName")?.value;
  return name && !/^GMT[+-]/.test(name) ? name : timeZone;
}
