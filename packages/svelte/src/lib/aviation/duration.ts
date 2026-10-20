/**
 * How `formatDuration` writes a length: `"short"` is "1 h 23 m", `"long"`
 * is "1 hour 23 minutes", `"clock"` is VATUSA's "1:23".
 */
export type DurationStyle = "short" | "long" | "clock";

/**
 * A length of time in minutes, as text: 83 is "1 h 23 m", "1 hour 23
 * minutes" or "1:23". Rounded to the minute; a negative length reads as its
 * size, so the caller writes "in" or "ago".
 */
export function formatDuration(minutes: number, style: DurationStyle): string {
  const total = Math.abs(Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;

  if (style === "clock") return `${h}:${String(m).padStart(2, "0")}`;

  const unit = (n: number, short: string, word: string) =>
    style === "short" ? `${n} ${short}` : `${n} ${word}${n === 1 ? "" : "s"}`;

  if (total === 0) return unit(0, "m", "minute");
  const hours = h > 0 ? unit(h, "h", "hour") : "";
  const mins = m > 0 ? unit(m, "m", "minute") : "";
  return [hours, mins].filter(Boolean).join(" ");
}
