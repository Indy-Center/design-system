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

  const parts: [number, string, string][] =
    style === "short"
      ? [
          [h, "h", "h"],
          [m, "m", "m"],
        ]
      : [
          [h, "hour", "hours"],
          [m, "minute", "minutes"],
        ];
  const said = parts
    .filter(([n]) => n > 0)
    .map(([n, one, many]) => `${n} ${n === 1 ? one : many}`);
  const [, , none] = parts[1];
  return said.length > 0 ? said.join(" ") : `0 ${none}`;
}
