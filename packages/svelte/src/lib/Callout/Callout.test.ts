import {
  mdiAlertOctagonOutline,
  mdiAlertOutline,
  mdiBookOpenVariantOutline,
  mdiInformationOutline,
} from "@mdi/js";
import { describe, expect, test } from "vitest";
import { translucent } from "../../../test/contrast.ts";
import { role, type Role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import type { CalloutLevel } from "../blocks.ts";
import Callout from "./Callout.svelte";
import CalloutWithContent from "./Callout.test.svelte";

const children = text("Hold departures behind a heavy for two minutes.");

// The component list's severity scale, with the FAA's words: each level's
// spoken label, icon, and the role its wash, border and icon are drawn in.
// `reference` has no colour: the muted surface and the border role.
const levels: [CalloutLevel, string, string, Role, Role, number][] = [
  ["info", "Note", mdiInformationOutline, "info", "info", 10],
  ["caution", "Caution", mdiAlertOutline, "warning", "warning", 10],
  [
    "danger",
    "Warning",
    mdiAlertOctagonOutline,
    "destructive",
    "destructive",
    10,
  ],
  ["reference", "Reference", mdiBookOpenVariantOutline, "muted", "border", 60],
];

describe("Callout", () => {
  test("is a landmark named by its visible label, not a live region", async () => {
    const screen = await renderIn("light", Callout, {
      level: "caution",
      children,
    });
    const aside = screen.getByRole("complementary", {
      name: "Caution",
      exact: true,
    });
    await expect.element(aside).toBeVisible();
    await expect.element(aside.getByText("Caution")).toBeVisible();
    // A document's note isn't news: that is Alert's.
    await expect.element(screen.getByRole("status")).not.toBeInTheDocument();
    await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();
  });

  test("a custom label shows in place of the level's word, which readers still hear", async () => {
    const screen = await renderIn("light", Callout, {
      level: "caution",
      label: "Wake turbulence",
      children,
    });
    const aside = screen.getByRole("complementary", {
      name: "Caution: Wake turbulence",
      exact: true,
    });
    await expect.element(aside).toBeVisible();
    // The label's line, with the level's word inside it for readers alone, as Alert's is.
    await expect
      .element(aside.getByText(/^Caution: Wake turbulence$/))
      .toBeVisible();
    const word = aside.getByText("Caution:", { exact: true });
    await expect.element(word).toHaveClass("sr-only");
  });

  describe.each(["light", "dark"] as const)("in %s", (scheme) => {
    test.each(levels)(
      "%s reads %s, with its own icon, tinted in its role",
      async (level, label, icon, wash, border, percent) => {
        const screen = await renderIn(scheme, Callout, { level, children });
        const aside = screen.getByRole("complementary", { name: label });
        await expect.element(aside).toHaveStyle({
          backgroundColor: translucent(role(wash, scheme), percent),
          borderTopColor:
            level === "reference"
              ? role(border, scheme)
              : translucent(role(border, scheme), 40),
          // A width needs its style: WebKit reads a width alone as 0px.
          borderTopStyle: "solid",
          borderTopWidth: "1px",
        });
        const svg = aside.element().querySelector("svg")!;
        expect(svg.querySelector("path")!.getAttribute("d")).toBe(icon);
        expect(svg.getAttribute("aria-hidden")).toBe("true");
        await expect.element(svg.querySelector("path")!).toHaveStyle({
          fill: role(
            level === "reference" ? "muted-foreground" : border,
            scheme,
          ),
        });
        await expect.element(aside.getByText(label)).toHaveStyle({
          color: role("foreground", scheme),
          fontWeight: "600",
        });
        await expect
          .element(aside.getByText(/^Hold departures/))
          .toHaveStyle({ color: role("foreground-soft", scheme) });
      },
    );
  });

  test("draws nested content after its label, without the content's outer margins", async () => {
    const screen = await renderIn("light", CalloutWithContent, {});
    const aside = screen.getByRole("complementary", { name: "Note" });
    await expect
      .element(aside)
      .toHaveTextContent("Note First paragraph. Second paragraph.");
    const [first, second] = aside.element().querySelectorAll("p:not([id])");
    expect(getComputedStyle(first!).marginTop).toBe("0px");
    expect(getComputedStyle(second!).marginBottom).toBe("0px");
    // Still the document's text between them.
    expect(getComputedStyle(first!).marginBottom).not.toBe("0px");
  });

  test("adds a caller's class and attributes to its aside", async () => {
    const screen = await renderIn("light", Callout, {
      level: "info",
      class: "my-5",
      id: "wake",
      children,
    });
    const aside = screen.getByRole("complementary", { name: "Note" });
    await expect.element(aside).toHaveClass("my-5", "rounded-lg");
    await expect.element(aside).toHaveAttribute("id", "wake");
  });
});
