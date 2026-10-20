// PROTOTYPE: the server reads the time-zone cookie, so a reload draws local
// times from the start (Zulu when there's none). `device:<zone>` means
// "Use my device's time zone": the server draws <zone>, the last one seen.
const isZone = (v: string | undefined) => {
  if (!v || v.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: v });
    return true;
  } catch {
    return false;
  }
};

export function load({
  cookies,
}: {
  cookies: { get(name: string): string | undefined };
}) {
  const raw = cookies.get("indy-time-zone");
  const follow = !!raw?.startsWith("device:");
  const zone = follow ? raw!.slice("device:".length) : raw;
  const scheme = cookies.get("indy-color-scheme");
  return {
    zone: isZone(zone) ? zone : undefined,
    follow: isZone(zone) && follow,
    scheme: scheme === "light" || scheme === "dark" ? scheme : "device",
  } as const;
}
