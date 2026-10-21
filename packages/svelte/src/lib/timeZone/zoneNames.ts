// How a time zone is named to a member: its city and its abbreviation.

/** "Indianapolis" from "America/Indiana/Indianapolis". */
export function cityOf(zone: string): string {
  return (zone.split("/").at(-1) ?? zone).replaceAll("_", " ");
}

/**
 * The zone's abbreviation at `at` in US English: `CDT`, or the offset
 * (`GMT+1`) for a zone without one.
 */
export function abbreviationOf(zone: string, at = new Date()): string {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "short" })
      .formatToParts(at)
      .find((part) => part.type === "timeZoneName")?.value ?? zone
  );
}

/** "Chicago (CDT)". */
export function zoneLabel(zone: string, at = new Date()): string {
  return `${cityOf(zone)} (${abbreviationOf(zone, at)})`;
}

/** A region's zones, for the picker's `<optgroup>`. */
export type ZoneGroup = {
  region: string;
  zones: { zone: string; label: string }[];
};

/**
 * Every zone this browser knows, grouped by region ("America", "Europe")
 * and sorted by the name after it ("Argentina / Buenos Aires", "Chicago").
 */
export function zoneGroups(at = new Date()): ZoneGroup[] {
  const groups = new Map<string, ZoneGroup["zones"]>();
  for (const zone of Intl.supportedValuesOf("timeZone")) {
    const [region, ...rest] = zone.split("/");
    if (!rest.length) continue;
    const place = rest.join(" / ").replaceAll("_", " ");
    const label = `${place} (${abbreviationOf(zone, at)})`;
    const list = groups.get(region) ?? [];
    list.push({ zone, label });
    groups.set(region, list);
  }
  return [...groups]
    .map(([region, zones]) => ({
      region,
      zones: zones.sort((a, b) => a.label.localeCompare(b.label)),
    }))
    .sort((a, b) => a.region.localeCompare(b.region));
}
