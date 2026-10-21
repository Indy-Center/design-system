/**
 * A frequency in hertz, from hertz or from megahertz as written
 * (`"128.225"`). Undefined when it isn't a number.
 */
export function toHertz(value: number | string): number | undefined {
  const hz =
    typeof value === "number"
      ? value
      : Math.round(Number(value.trim() || NaN) * 1_000_000);
  return Number.isFinite(hz) && hz > 0 ? hz : undefined;
}
