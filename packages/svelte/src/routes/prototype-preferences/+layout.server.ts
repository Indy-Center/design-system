// PROTOTYPE: the server reads the time-zone cookie, so a reload draws local
// times from the start (Zulu when there's none).
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
  const zone = cookies.get("indy-time-zone");
  const scheme = cookies.get("indy-color-scheme");
  return {
    zone: isZone(zone) ? zone : undefined,
    scheme: scheme === "light" || scheme === "dark" ? scheme : "device",
  } as const;
}
