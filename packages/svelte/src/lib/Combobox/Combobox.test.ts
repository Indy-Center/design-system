import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Combobox from "./Combobox.svelte";
import Picker from "./Combobox.test.svelte";

type Screen = RenderResult<typeof Picker>;

/**
 * The option the combobox's aria-activedescendant points at, as its text
 * and aria-selected; null when there is none.
 */
function activeOption(screen: Screen) {
  const id = screen
    .getByRole("combobox")
    .element()
    .getAttribute("aria-activedescendant");
  const option = id ? document.getElementById(id) : null;
  return option
    ? {
        text: option.textContent?.trim(),
        selected: option.getAttribute("aria-selected"),
      }
    : null;
}

describe("Combobox", () => {
  test("is a collapsed combobox named by Field's label", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox", { name: "Controller" });
    await expect.element(input).toHaveAttribute("aria-expanded", "false");
    const list = document.getElementById(
      input.element().getAttribute("aria-controls")!,
    );
    expect(list?.getAttribute("role")).toBe("listbox");
  });

  test("typing opens the list of matches, none of them active yet", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    await input.fill("ba");
    await expect.element(input).toHaveAttribute("aria-expanded", "true");
    await expect
      .element(screen.getByRole("option", { name: "Ben Baker" }))
      .toBeVisible();
    expect(screen.getByRole("option").elements()).toHaveLength(1);
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  // The WAI pattern's keyboard table, for an editable combobox with a list:
  // https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
  describe("keyboard", () => {
    test.each([
      ["{ArrowDown}", "Ann Archer"],
      ["{ArrowUp}", "Cara Cole"],
      ["{ArrowDown}{ArrowDown}", "Ben Baker"],
      ["{ArrowDown}{ArrowUp}", "Cara Cole"],
      ["{ArrowUp}{ArrowDown}", "Ann Archer"],
    ])("%s makes %s the active option", async (keys, name) => {
      const screen = await renderIn("light", Picker, {});
      await userEvent.tab();
      await userEvent.keyboard(keys);
      const input = screen.getByRole("combobox");
      await expect.element(input).toHaveAttribute("aria-expanded", "true");
      await expect
        .poll(() => activeOption(screen))
        .toEqual({ text: name, selected: "true" });
      await expect.element(input).toHaveFocus();
    });

    test("Enter picks the active option and closes the list", async () => {
      const screen = await renderIn("light", Picker, {});
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
      const input = screen.getByRole("combobox");
      await expect.element(input).toHaveValue("Ben Baker");
      await expect.element(input).toHaveAttribute("aria-expanded", "false");
      await expect.element(input).toHaveFocus();
      await expect
        .element(screen.getByTestId("picked"))
        .toHaveTextContent("1000002");
      const form = input.element().closest("form")!;
      expect(new FormData(form).get("controller")).toBe("1000002");
    });

    test.each([
      ["{Home}", 0],
      ["{End}", 2],
      ["{ArrowLeft}", 0],
      ["{ArrowRight}", 2],
    ])(
      "%s moves the caret in the box and leaves the list",
      async (key, caret) => {
        const screen = await renderIn("light", Picker, {});
        const input = screen.getByRole("combobox");
        await input.fill("an");
        // Put the caret mid-text so each key has somewhere to go.
        (input.element() as HTMLInputElement).setSelectionRange(1, 1);
        await userEvent.keyboard(`{ArrowDown}${key}`);
        await expect.element(input).toHaveAttribute("aria-expanded", "true");
        expect(input).not.toHaveAttribute("aria-activedescendant");
        expect((input.element() as HTMLInputElement).selectionStart).toBe(
          caret,
        );
      },
    );

    test("Tab leaves without picking and closes the list", async () => {
      const screen = await renderIn("light", Picker, {});
      const input = screen.getByRole("combobox");
      await input.fill("a");
      await userEvent.keyboard("{ArrowDown}{Tab}");
      await expect.element(input).toHaveAttribute("aria-expanded", "false");
      await expect.element(input).toHaveValue("a");
      await expect
        .element(screen.getByTestId("picked"))
        .toHaveTextContent("none");
    });

    test("Escape closes the open list and keeps the text", async () => {
      const screen = await renderIn("light", Picker, {});
      const input = screen.getByRole("combobox");
      await input.fill("an");
      await userEvent.keyboard("{ArrowDown}{Escape}");
      await expect.element(input).toHaveAttribute("aria-expanded", "false");
      await expect.element(input).toHaveValue("an");
      await expect.element(input).toHaveFocus();
      expect(input).not.toHaveAttribute("aria-activedescendant");
    });

    test("Escape on a closed list clears the box and the pick", async () => {
      const screen = await renderIn("light", Picker, {
        value: { cid: "1000001", name: "Ann Archer" },
      });
      const input = screen.getByRole("combobox");
      await expect.element(input).toHaveValue("Ann Archer");
      await userEvent.tab();
      await userEvent.keyboard("{Escape}");
      await expect.element(input).toHaveValue("");
      await expect
        .element(screen.getByTestId("picked"))
        .toHaveTextContent("none");
    });
  });

  test("announces how many options match", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    await input.fill("a");
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("3 results");
    await input.fill("ben");
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("1 result");
  });

  test("says when nothing matches", async () => {
    const screen = await renderIn("light", Picker, {});
    await screen.getByRole("combobox").fill("zz");
    await expect.element(screen.getByText("No matches")).toBeVisible();
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("No results");
  });

  describe("with a search function", () => {
    const roster = [
      { cid: "1000001", name: "Ann Archer" },
      { cid: "1000004", name: "Dan Andrews" },
    ];
    /** Searches the roster; the first letter's answer comes back last. */
    const search = (query: string) =>
      new Promise<typeof roster>((resolve) =>
        setTimeout(
          () => resolve(roster.filter((c) => c.name.includes(query))),
          query.length === 1 ? 300 : 20,
        ),
      );

    test("lists what the function finds for the typed text", async () => {
      const screen = await renderIn("light", Picker, { options: search });
      await screen.getByRole("combobox").fill("Dan");
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      expect(screen.getByRole("option").elements()).toHaveLength(1);
    });

    test("says it is searching until the answer comes", async () => {
      const screen = await renderIn("light", Picker, { options: search });
      await screen.getByRole("combobox").fill("A");
      await expect.element(screen.getByText("Searching…")).toBeVisible();
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      await expect
        .element(screen.getByText("Searching…"))
        .not.toBeInTheDocument();
    });

    test("ignores an answer that comes back after a newer one", async () => {
      const screen = await renderIn("light", Picker, { options: search });
      const input = screen.getByRole("combobox");
      await userEvent.click(input);
      await userEvent.keyboard("A");
      await userEvent.keyboard("r");
      await expect
        .element(screen.getByRole("option", { name: "Ann Archer" }))
        .toBeVisible();
      // Long enough for the answer to "A" to land.
      await new Promise((resolve) => setTimeout(resolve, 400));
      expect(screen.getByRole("option").elements()).toHaveLength(1);
    });
  });

  test("a click on the box opens the list", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    await input.click();
    await expect.element(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option").elements()).toHaveLength(3);
  });

  test("takes Field's hint and error", async () => {
    const screen = await renderIn("light", Picker, {
      hint: "Name or CID.",
      error: "Pick a controller.",
    });
    const input = screen.getByRole("combobox");
    await expect
      .element(input)
      .toHaveAccessibleDescription("Name or CID. Pick a controller.");
    await expect.element(input).toHaveAttribute("aria-invalid", "true");
  });

  // The `card` fill, `muted` on the active option, and a `ring` outline
  // round it.
  test.each(SCHEMES)(
    "draws the list on the card, the active option ringed, in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Picker, {});
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}");
      const list = screen.getByRole("listbox");
      await expect
        .element(page.elementLocator(list.element().parentElement!))
        .toHaveStyle({ backgroundColor: role("card", scheme) });
      await expect
        .element(screen.getByRole("option", { name: "Ann Archer" }))
        .toHaveStyle({
          backgroundColor: role("muted", scheme),
          outlineStyle: "solid",
          outlineColor: role("ring", scheme),
        });
    },
  );

  // The `input` border and `muted` fill, as Input has.
  test("its box takes the input roles", async () => {
    const screen = await renderIn("light", Picker, {});
    await expect.element(screen.getByRole("combobox")).toHaveStyle({
      backgroundColor: role("muted", "light"),
      borderColor: role("input", "light"),
    });
  });

  test("its box and options are at least 44px tall", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    await input.click();
    for (const el of [
      input.element(),
      ...screen.getByRole("option").elements(),
    ]) {
      expect(el.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
  });

  test("a click outside closes the list", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    await input.fill("a");
    await expect.element(input).toHaveAttribute("aria-expanded", "true");
    await screen.getByRole("button", { name: "Elsewhere" }).click();
    await expect.element(input).toHaveAttribute("aria-expanded", "false");
  });

  test("runs the caller's own event handlers too", async () => {
    const seen: string[] = [];
    const screen = await renderIn("light", Combobox, {
      "aria-label": "Position",
      options: ["IND_CTR", "IND_APP"],
      onkeydown: (event) => seen.push(`key ${event.key}`),
      oninput: () => seen.push("input"),
    });
    await screen.getByRole("combobox").fill("IND");
    await userEvent.keyboard("{ArrowDown}");
    expect(seen).toEqual(["input", "key ArrowDown"]);
    await expect
      .element(screen.getByRole("combobox"))
      .toHaveAttribute("aria-activedescendant");
  });

  test("says so when the search fails", async () => {
    const screen = await renderIn("light", Picker, {
      options: () => Promise.reject(new Error("offline")),
    });
    await screen.getByRole("combobox").fill("a");
    await expect
      .element(
        screen.getByText("Couldn't search").and(page.getByRole("paragraph")),
      )
      .toBeVisible();
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("Couldn't search");
  });

  test("draws each option with the caller's snippet", async () => {
    const screen = await renderIn("light", Picker, { withCid: true });
    await screen.getByRole("combobox").fill("ben");
    await expect
      .element(screen.getByRole("option").getByText("1000002"))
      .toHaveClass("font-mono");
  });

  test("a click on an option picks it", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    await input.fill("c");
    await screen.getByRole("option", { name: "Cara Cole" }).click();
    await expect.element(input).toHaveValue("Cara Cole");
    await expect.element(input).toHaveAttribute("aria-expanded", "false");
    await expect.element(input).toHaveFocus();
    await expect
      .element(screen.getByTestId("picked"))
      .toHaveTextContent("1000003");
  });

  test("announces the option picked", async () => {
    const screen = await renderIn("light", Picker, {});
    await userEvent.tab();
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("Cara Cole, selected");
  });
});
