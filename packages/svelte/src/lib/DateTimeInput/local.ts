// Between an instant in UTC and the text of a `datetime-local` box, which
// is the member's own clock: `2026-10-20T19:00`. Browser only: both read
// the page's time zone.

/** The instant in an ISO string, as the box's local text; "" if it isn't one. */
export function toLocal(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = [at.getFullYear(), pad(at.getMonth() + 1), pad(at.getDate())];
  return `${date.join("-")}T${pad(at.getHours())}:${pad(at.getMinutes())}`;
}

/** The box's local text as an ISO string in UTC; undefined while it's empty. */
export function fromLocal(text: string): string | undefined {
  if (!text) return undefined;
  const at = new Date(text);
  return Number.isNaN(at.getTime()) ? undefined : at.toISOString();
}
