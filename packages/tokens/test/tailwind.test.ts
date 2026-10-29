import { afterAll, describe, expect, test } from "vitest";
import { closeBrowser, pageWith } from "./browser.ts";
import { tailwind } from "./compile.ts";
import { brandColours, rgb, roles } from "./guide.ts";

afterAll(closeBrowser);

const appCss = `
@import "tailwindcss";
@import "@indy-center/centerline-tokens/tokens.css";
@import "@indy-center/centerline-tokens/theme.css";
`;

/** A light page with a dark header, the guide's framed light. */
const page = `
<main>
  <div id="card" class="bg-card"></div>
  <div id="variant" class="bg-white dark:bg-night"></div>
  <h2 id="heading" class="font-heading">Events</h2>
  <span id="cid" class="font-mono">1234567</span>
</main>
<header data-theme="dark">
  <div id="dark-card" class="bg-card"></div>
  <div id="dark-variant" class="bg-white dark:bg-night"></div>
</header>
`;

const css = await tailwind(appCss, [
  "bg-card",
  "bg-white",
  "dark:bg-night",
  "font-heading",
  "font-mono",
]);

// One page for every test; closeBrowser closes it with the browser.
const p = await pageWith(`<style>${css}</style>${page}`);

async function style(selector: string, property: string) {
  return p.$eval(
    selector,
    (el, property) => getComputedStyle(el).getPropertyValue(property),
    property,
  );
}

describe("Tailwind compiled against tokens.css and theme.css", () => {
  test("bg-card is the light card at the root", async () => {
    expect(await style("#card", "background-color")).toBe(
      rgb(roles.card.light),
    );
  });

  test("bg-card is the dark card inside a data-theme=dark element on a light page", async () => {
    expect(await style("#dark-card", "background-color")).toBe(
      rgb(roles.card.dark),
    );
  });

  test("dark: utilities apply inside a dark scope and not outside it", async () => {
    expect(await style("#dark-variant", "background-color")).toBe(
      rgb(brandColours.night),
    );
    expect(await style("#variant", "background-color")).toBe(
      rgb(brandColours.white),
    );
  });

  test("font-heading sets Source Sans 3 first", async () => {
    expect(await style("#heading", "font-family")).toMatch(/^"Source Sans 3",/);
  });

  test("font-mono is the system monospace with tabular numbers", async () => {
    expect(await style("#cid", "font-family")).toMatch(/^ui-monospace,/);
    expect(await style("#cid", "font-variant-numeric")).toBe("tabular-nums");
  });
});
