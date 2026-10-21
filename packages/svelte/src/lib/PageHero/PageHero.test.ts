import { afterEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import {
  SCHEMES,
  SURFACES,
  contrastOn,
  translucent,
} from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import PageHero from "./PageHero.svelte";

const lead = "Virtual air traffic control over the Midwest.";
const welcome = { title: "Welcome to Indy Center", children: text(lead) };

/** The hero's own box, around the heading. */
const heroOf = (heading: Element) =>
  heading.closest("main > *, header > *") as HTMLElement;

describe("PageHero", () => {
  afterEach(() => page.viewport(414, 896));

  test("gives the page its h1, with the content under it", async () => {
    const screen = await renderIn("light", PageHero, welcome);
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Welcome to Indy Center",
    });
    await expect.element(heading).toBeInTheDocument();
    const content = screen.getByText(lead);
    expect(
      heading.element().compareDocumentPosition(content.element()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  // The community site's home heading was 4xl on a phone and smaller on
  // wider screens. Now: 3xl (PageHeader's) on a phone, 4xl from sm up,
  // semibold in Source Sans 3 as chosen in ticket 10.
  test.each([
    [390, "30px"],
    [1280, "36px"],
  ])("at %ipx wide, has a %s semibold title", async (width, size) => {
    await page.viewport(width, 800);
    const screen = await renderIn("light", PageHero, welcome);
    const heading = screen.getByRole("heading", { level: 1 });
    await expect
      .element(heading)
      .toHaveStyle({ fontSize: size, fontWeight: "600" });
    expect(getComputedStyle(heading.element()).fontFamily).toMatch(
      /^"Source Sans 3"/,
    );
  });

  // A `card` to `background` gradient; the title in `foreground`, the
  // content in `foreground-soft`.
  test.each(SCHEMES)("follows the roles in %s", async (scheme) => {
    const screen = await renderIn(scheme, PageHero, welcome);
    const heading = screen.getByRole("heading", { level: 1 });
    await expect
      .element(heading)
      .toHaveStyle({ color: role("foreground", scheme) });
    const image = getComputedStyle(heroOf(heading.element())).backgroundImage;
    expect(image).toMatch(/^linear-gradient\(/);
    const card = image.indexOf(role("card", scheme));
    expect(card).toBeGreaterThan(-1);
    expect(image.indexOf(role("background", scheme))).toBeGreaterThan(card);
    await expect
      .element(screen.getByText(lead))
      .toHaveStyle({ color: role("foreground-soft", scheme) });
  });

  // The halftone chosen in ticket 10: 1px dots every 20px, in the
  // `foreground` role at 12%.
  test.each(SCHEMES)(
    "lays foreground dots at 12% over the gradient in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, PageHero, welcome);
      const hero = heroOf(screen.getByRole("heading").element());
      const dots = hero.firstElementChild!;
      expect(dots.getAttribute("aria-hidden")).toBe("true");
      const style = getComputedStyle(dots);
      expect(style.backgroundImage).toMatch(/^radial-gradient\(/);
      expect(style.backgroundSize).toBe("20px 20px");
      expect(style.color).toBe(translucent(role("foreground", scheme), 12));
    },
  );

  // Text can land on a dot, so the worst case is the gradient's either end
  // with a dot under it.
  test.each(SCHEMES)(
    "keeps its title and content readable over the dots in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, PageHero, welcome);
      const hero = heroOf(screen.getByRole("heading").element());
      const dot = getComputedStyle(hero.firstElementChild!).color;
      for (const surface of Object.values(SURFACES[scheme])) {
        for (const el of [
          screen.getByRole("heading").element(),
          screen.getByText(lead).element(),
        ]) {
          expect(contrastOn(el, surface)).toBeGreaterThanOrEqual(4.5);
          expect(contrastOn(el, surface, dot)).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );

  test.each([
    ["default", "64px"],
    ["compact", "32px"],
  ] as const)(
    "in the %s size, has %s above the title on a phone",
    async (size, padding) => {
      await page.viewport(390, 800);
      const screen = await renderIn("light", PageHero, { ...welcome, size });
      const inner = screen.getByRole("heading").element().parentElement!;
      expect(getComputedStyle(inner).paddingTop).toBe(padding);
    },
  );

  test("adds a caller's class and attributes to its box", async () => {
    const screen = await renderIn("light", PageHero, {
      ...welcome,
      id: "hero",
      class: "mb-8",
    });
    const hero = heroOf(screen.getByRole("heading").element());
    expect(hero.id).toBe("hero");
    expect(getComputedStyle(hero)).toMatchObject({
      marginBottom: "32px",
      overflow: "hidden",
    });
  });
});
