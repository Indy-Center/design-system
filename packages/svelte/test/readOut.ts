// What an element says to a sighted member and to a screen reader, for
// components that show one thing and read out another (Frequency).

/** The text a screen reader reads: everything not `aria-hidden`, spaces collapsed. */
export function readOut(host: Element): string {
  const copy = host.cloneNode(true) as Element;
  copy.querySelectorAll("[aria-hidden='true']").forEach((e) => e.remove());
  return (copy.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** The text on screen: everything but `.sr-only`, spaces collapsed. */
export function onScreen(host: Element): string {
  const copy = host.cloneNode(true) as Element;
  copy.querySelectorAll(".sr-only").forEach((e) => e.remove());
  return (copy.textContent ?? "").replace(/\s+/g, " ").trim();
}
