// What an element says to a sighted member and to a screen reader, for
// components that show one thing and read out another (Frequency).

/** `host`'s text without the elements `selector` matches, spaces collapsed. */
function textWithout(host: Element, selector: string): string {
  const copy = host.cloneNode(true) as Element;
  copy.querySelectorAll(selector).forEach((e) => e.remove());
  return (copy.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** The text a screen reader reads: everything not `aria-hidden`. */
export const readOut = (host: Element) =>
  textWithout(host, "[aria-hidden='true']");

/** The text on screen: everything but `.sr-only`. */
export const onScreen = (host: Element) => textWithout(host, ".sr-only");
