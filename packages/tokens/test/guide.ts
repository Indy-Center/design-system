/**
 * The brand guide's tables, copied by hand from
 * brand-guide/guide/color-and-type.md. The tests hold the built outputs to
 * these values, so a token file that drifts from the guide fails.
 */

export const brandColours = {
  night: "#070F13",
  sky: "#0369A1",
  white: "#FFFFFF",
} as const;

export const roles: Record<
  string,
  { usedFor: string; light: string; dark: string }
> = {
  background: { usedFor: "Page background", light: "#F1F5F9", dark: "#111827" },
  card: { usedFor: "Cards and panels", light: "#FFFFFF", dark: "#1E293B" },
  muted: {
    usedFor: "Raised areas, input fills, table heads",
    light: "#E2E8F0",
    dark: "#334155",
  },
  border: {
    usedFor: "Lines around cards and tables",
    light: "#E2E8F0",
    dark: "#334155",
  },
  input: { usedFor: "Input borders", light: "#64748B", dark: "#64748B" },
  foreground: { usedFor: "Headings", light: "#0F172A", dark: "#FFFFFF" },
  "foreground-soft": {
    usedFor: "Body text",
    light: "#334155",
    dark: "#D1D5DB",
  },
  "muted-foreground": {
    usedFor: "Captions and fine print",
    light: "#475569",
    dark: "#9CA3AF",
  },
  placeholder: {
    usedFor: "Placeholder text in inputs",
    light: "#475569",
    dark: "#D1D5DB",
  },
  primary: {
    usedFor: "Main buttons, the current page number",
    light: "#0369A1",
    dark: "#0369A1",
  },
  "primary-hover": {
    usedFor: "Main buttons on hover",
    light: "#075985",
    dark: "#075985",
  },
  "primary-foreground": {
    usedFor: "Text on main buttons",
    light: "#FFFFFF",
    dark: "#FFFFFF",
  },
  link: { usedFor: "Links", light: "#0369A1", dark: "#38BDF8" },
  ring: { usedFor: "Focus outlines", light: "#0284C7", dark: "#0EA5E9" },
  destructive: {
    usedFor: "Errors and actions that delete",
    light: "#B91C1C",
    dark: "#F87171",
  },
  success: { usedFor: "Success", light: "#15803D", dark: "#4ADE80" },
  warning: { usedFor: "Warnings", light: "#A16207", dark: "#FACC15" },
  info: {
    usedFor: "Information and notices",
    light: "#0369A1",
    dark: "#38BDF8",
  },
};

/** "#0369A1" → "rgb(3, 105, 161)", the form getComputedStyle returns. */
export function rgb(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}
