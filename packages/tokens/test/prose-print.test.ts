import { afterAll, describe, expect, test } from "vitest";
import { closeBrowser, pageWith } from "./browser.ts";
import { tailwind } from "./compile.ts";

afterAll(closeBrowser);

const appCss = `
@import "tailwindcss";
@import "@indy-center/centerline-tokens/tokens.css";
@import "@indy-center/centerline-tokens/theme.css";
@plugin "@tailwindcss/typography";
@import "@indy-center/centerline-tokens/prose.css";
`;

const css = await tailwind(appCss, [
  "prose-centerline",
  "prose",
  "bg-background",
  "sr-only",
]);

/** A dark page: chrome around prose, and prose inside a dark header panel. */
const page = `
<div data-theme="dark" id="page" class="bg-background">
  <header data-theme="dark" id="header"><a class="sr-only" id="skip" href="#main">Skip</a><nav data-theme="dark" id="appnav">Nav</nav></header>
  <main id="main">
    <article class="prose prose-centerline" id="prose">
      <h2 id="h">Title <a href="#h" id="anchor" data-heading-anchor>#</a> <a href="#other" id="inbody">see</a></h2>
      <p id="p">See <a id="ext" href="https://example.com/x" target="_blank">the order</a> and <a id="int" href="/a">a page</a>.</p>
      <aside aria-labelledby="callout-label" id="callout"><div><p id="callout-label">Note</p><div><p>Notice</p></div></div></aside>
      <figure id="figure"><pre>code</pre></figure>
      <table><tbody><tr id="row"><td>cell</td></tr></tbody></table>
      <ul><li><label><input id="box" type="checkbox" checked> Tick</label></li></ul>
    </article>
  </main>
  <header data-theme="dark" id="panel"><div class="prose prose-centerline"><p id="inpanel">Inside a panel</p></div></header>
  <footer data-theme="dark" id="footer">Footer</footer>
  <div id="narrow" style="width: 300px"><div class="prose prose-centerline"><table id="wide"><thead><tr><th>Runway</th><th>Length</th><th>Surface</th><th>Lighting</th><th>Approach</th><th>Remarks</th></tr></thead><tbody><tr><td>Runway nine</td><td>Ten thousand</td><td>Asphalt</td><td>High intensity</td><td>Precision</td><td>Made-up remarks</td></tr></tbody></table></div></div>
</div>
`;

const p = await pageWith(`<style>${css}</style>${page}`);

async function style(selector: string, property: string, pseudo?: string) {
  return p.$eval(
    selector,
    (el, [property, pseudo]) =>
      getComputedStyle(el, pseudo).getPropertyValue(property!),
    [property, pseudo] as const,
  );
}

describe("prose.css on screen, for contrast", () => {
  test("keeps the dark scheme and the chrome", async () => {
    await p.emulateMedia({ media: "screen" });
    expect(await style("#p", "color")).not.toBe("rgb(0, 0, 0)");
    expect(await style("#page", "background-color")).not.toBe(
      "rgb(255, 255, 255)",
    );
    expect(await style("#header", "display")).toBe("block");
    expect(await style("#anchor", "display")).toBe("inline");
  });
});

describe("prose.css in print", () => {
  test("sets the roles to black and white, whatever the scheme", async () => {
    await p.emulateMedia({ media: "print" });
    // This compile doesn't order the plugin's .prose before the
    // prose-centerline utility as the app's build does, so the roles the
    // prose reads are checked rather than its final colours.
    for (const id of ["#prose", "#inpanel"]) {
      expect(await style(id, "--color-foreground-soft")).toBe("#000");
      expect(await style(id, "--color-foreground")).toBe("#000");
      expect(await style(id, "--color-link")).toBe("#000");
      expect(await style(id, "--color-muted")).toBe("#fff");
    }
    expect(await style("#page", "background-color")).toBe("rgb(255, 255, 255)");
  });

  test("hides the chrome, but not a panel that holds prose", async () => {
    await p.emulateMedia({ media: "print" });
    for (const id of ["#header", "#appnav", "#footer", "#skip"]) {
      expect(await style(id, "display")).toBe("none");
    }
    expect(await style("#panel", "display")).toBe("block");
  });

  test("shows the URL after an external link, and none after an internal one", async () => {
    await p.emulateMedia({ media: "print" });
    expect(await style("#ext", "content", "::after")).toBe(
      '" (https://example.com/x)"',
    );
    expect(await style("#int", "content", "::after")).toBe("none");
  });

  test("prints checkboxes empty", async () => {
    await p.emulateMedia({ media: "print" });
    expect(await style("#box", "appearance")).toBe("none");
  });

  test("keeps a figure, a table row and a callout whole", async () => {
    await p.emulateMedia({ media: "print" });
    for (const id of ["#figure", "#row", "#callout"]) {
      expect(await style(id, "break-inside")).toBe("avoid");
    }
  });

  test("fits a wide table to the page, so no column is cut off", async () => {
    await p.emulateMedia({ media: "print" });
    expect(await style("#wide", "display")).toBe("table");
    const box = await p.$eval("#wide", (el) => el.getBoundingClientRect());
    expect(box.width).toBeLessThanOrEqual(300);
    // On screen the same table scrolls in its own box instead.
    await p.emulateMedia({ media: "screen" });
    expect(await style("#wide", "overflow-x")).toBe("auto");
  });

  // This selector matches the link RichText draws inside a heading; the
  // callout's above matches Callout's <aside>.
  test("hides a heading's anchor link", async () => {
    await p.emulateMedia({ media: "print" });
    expect(await style("#anchor", "display")).toBe("none");
    // An author's own link to a #id in a heading stays.
    expect(await style("#inbody", "display")).toBe("inline");
  });
});
