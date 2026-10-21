import { tick } from "svelte";
import { describe, expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Combobox from "./Combobox.svelte";
import InlineSearch from "./Combobox.inline.test.svelte";
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

/**
 * Once the work already queued has run and the page has updated: answers
 * given and resets made, which land in microtasks.
 */
async function settled() {
  await new Promise((resolve) => setTimeout(resolve));
  await tick();
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

    test("Escape on an empty box is left to the dialog it sits in", async () => {
      const screen = await renderIn("light", Combobox, {
        "aria-label": "Position",
        options: ["IND_CTR", "IND_APP"],
      });
      const dialog = document.createElement("dialog");
      onTestFinished(() => dialog.remove());
      screen.container.replaceWith(dialog);
      dialog.append(screen.container);
      dialog.showModal();
      const input = screen.getByRole("combobox");
      await input.fill("IND_CTR");
      // The first Escape closes the list, the second clears the box; both
      // are the combobox's, so the dialog stays open.
      await userEvent.keyboard("{Escape}{Escape}");
      await expect.element(input).toHaveValue("");
      expect(dialog.open).toBe(true);
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => dialog.open).toBe(false);
    });

    test("Alt+Down opens the list with no option active", async () => {
      const screen = await renderIn("light", Picker, {});
      await userEvent.tab();
      await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
      const input = screen.getByRole("combobox");
      await expect.element(input).toHaveAttribute("aria-expanded", "true");
      expect(input).not.toHaveAttribute("aria-activedescendant");
    });

    test("Alt+Up closes the list, keeping the text and focus", async () => {
      const screen = await renderIn("light", Picker, {});
      const input = screen.getByRole("combobox");
      await input.fill("an");
      await userEvent.keyboard("{ArrowDown}{Alt>}{ArrowUp}{/Alt}");
      await expect.element(input).toHaveAttribute("aria-expanded", "false");
      await expect.element(input).toHaveValue("an");
      await expect.element(input).toHaveFocus();
      expect(input).not.toHaveAttribute("aria-activedescendant");
      await expect
        .element(screen.getByTestId("picked"))
        .toHaveTextContent("none");
    });

    test("Alt+Up on a closed list is left to the page", async () => {
      const screen = await renderIn("light", Picker, {});
      const input = screen.getByRole("combobox");
      let prevented: boolean | undefined;
      const listen = (event: KeyboardEvent) => {
        prevented = event.defaultPrevented;
      };
      window.addEventListener("keydown", listen);
      try {
        await userEvent.click(input);
        await userEvent.keyboard("{Escape}{Alt>}{ArrowUp}{/Alt}");
        expect(prevented).toBe(false);
      } finally {
        window.removeEventListener("keydown", listen);
      }
      await expect.element(input).toHaveAttribute("aria-expanded", "false");
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
    await expect
      .element(screen.getByText("No matches").and(page.getByRole("paragraph")))
      .toBeVisible();
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("No matches");
  });

  describe("with a search function", () => {
    const roster = [
      { cid: "1000001", name: "Ann Archer" },
      { cid: "1000004", name: "Dan Andrews" },
    ];
    const find = (query: string) =>
      roster.filter((c) => c.name.includes(query));
    /** Searches the roster, answering at once. */
    const search = async (query: string) => find(query);

    /**
     * A search function whose answers come only when the test gives them,
     * so a test can act while a search is out, with no clock to race.
     */
    function heldSearch() {
      const out: { query: string; give: (answer: typeof roster) => void }[] =
        [];
      return {
        search: (query: string) =>
          new Promise<typeof roster>((give) => out.push({ query, give })),
        /** Every text the function has been asked for, in order. */
        asked: () => out.map((search) => search.query),
        /** Answers each search for `query` still out. */
        answer(query: string) {
          for (const search of out.filter((s) => s.query === query)) {
            search.give(find(query));
          }
        },
      };
    }

    test("lists what the function finds for the typed text", async () => {
      const screen = await renderIn("light", Picker, { options: search });
      await screen.getByRole("combobox").fill("Dan");
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      expect(screen.getByRole("option").elements()).toHaveLength(1);
    });

    test("says it is searching until the answer comes", async () => {
      const held = heldSearch();
      const screen = await renderIn("light", Picker, { options: held.search });
      await screen.getByRole("combobox").fill("A");
      await expect.element(screen.getByText("Searching…")).toBeVisible();
      held.answer("A");
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      await expect
        .element(screen.getByText("Searching…"))
        .not.toBeInTheDocument();
    });

    test("reopened on the same text, one Down Arrow lands on the first option", async () => {
      const held = heldSearch();
      const screen = await renderIn("light", Picker, { options: held.search });
      const input = screen.getByRole("combobox");
      await input.fill("Dan Andrews");
      held.answer("Dan Andrews");
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      await userEvent.keyboard("{Escape}{ArrowDown}");
      await expect
        .poll(() => activeOption(screen))
        .toEqual({ text: "Dan Andrews", selected: "true" });
      // No second search, which would clear it.
      expect(held.asked()).toEqual(["Dan Andrews"]);
    });

    test.each([
      ["{ArrowDown}", "Ann Archer"],
      ["{ArrowUp}", "Dan Andrews"],
    ])(
      "%s on a closed box opens it on %s once the answer comes",
      async (key, name) => {
        const held = heldSearch();
        const screen = await renderIn("light", Picker, {
          options: held.search,
        });
        await userEvent.tab();
        await userEvent.keyboard(key);
        held.answer("");
        await expect
          .poll(() => activeOption(screen))
          .toEqual({ text: name, selected: "true" });
      },
    );

    test("after a pick, one Down Arrow reopens the list on the first option", async () => {
      const screen = await renderIn("light", Picker, { options: search });
      const input = screen.getByRole("combobox");
      await input.fill("Dan");
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      await userEvent.keyboard("{ArrowDown}{Enter}");
      await expect.element(input).toHaveValue("Dan Andrews");
      await userEvent.keyboard("{ArrowDown}");
      await expect
        .poll(() => activeOption(screen))
        .toEqual({ text: "Dan Andrews", selected: "true" });
    });

    test("typing before the answer comes cancels the Down Arrow's move", async () => {
      const held = heldSearch();
      const screen = await renderIn("light", Picker, { options: held.search });
      const input = screen.getByRole("combobox");
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}A");
      held.answer("");
      held.answer("A");
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      expect(input).not.toHaveAttribute("aria-activedescendant");
    });

    test("reopened on the same text, typing new text searches it", async () => {
      const screen = await renderIn("light", Picker, { options: search });
      const input = screen.getByRole("combobox");
      await input.fill("Dan");
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      await userEvent.keyboard("{Escape}{ArrowDown}");
      await expect
        .poll(() => activeOption(screen))
        .toEqual({ text: "Dan Andrews", selected: "true" });
      await input.fill("Ann");
      await expect
        .element(screen.getByRole("option", { name: "Ann Archer" }))
        .toBeVisible();
    });

    test("a new search function searches the same text again", async () => {
      const screen = await renderIn("light", Picker, { options: search });
      await screen.getByRole("combobox").fill("Dan");
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      const otherRoster = [{ cid: "1000009", name: "Dana Dunn" }];
      await screen.rerender({ options: async () => otherRoster });
      await expect
        .element(screen.getByRole("option", { name: "Dana Dunn" }))
        .toBeVisible();
    });

    test("while a new search function looks, its old list can't be picked from", async () => {
      const screen = await renderIn("light", Picker, { options: search });
      const input = screen.getByRole("combobox");
      await input.fill("Dan");
      const dan = screen.getByRole("option", { name: "Dan Andrews" });
      await expect.element(dan).toBeVisible();
      const otherRoster = [{ cid: "1000009", name: "Dana Dunn" }];
      let give: (answer: typeof otherRoster) => void = () => {};
      await screen.rerender({
        options: () => new Promise((resolve) => (give = resolve)),
      });
      await userEvent.keyboard("{ArrowDown}");
      expect(input).not.toHaveAttribute("aria-activedescendant");
      await dan.click();
      await expect
        .element(screen.getByTestId("picked"))
        .toHaveTextContent("none");
      give(otherRoster);
      await expect
        .element(screen.getByRole("option", { name: "Dana Dunn" }))
        .toBeVisible();
    });

    test("a search function written inline searches once per text", async () => {
      const searches: string[] = [];
      const screen = await renderIn("light", InlineSearch, {
        onsearch: (query) => searches.push(query),
      });
      const input = screen.getByRole("combobox");
      await input.fill("Dan");
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      // The page changes something else; the list stays the same answer.
      await userEvent.keyboard("{Escape}");
      await screen.getByRole("button", { name: "Count 0" }).click();
      await expect
        .element(screen.getByRole("button", { name: "Count 1" }))
        .toBeVisible();
      await input.click();
      await userEvent.keyboard("{ArrowDown}");
      await expect
        .poll(() => input.element().getAttribute("aria-activedescendant"))
        .not.toBeNull();
      expect(searches.filter((query) => query === "Dan")).toHaveLength(1);
    });

    test("while searching, the arrows and Enter don't reach the last list", async () => {
      const held = heldSearch();
      const screen = await renderIn("light", Picker, { options: held.search });
      const input = screen.getByRole("combobox");
      await input.fill("Dan");
      held.answer("Dan");
      await expect
        .element(screen.getByRole("option", { name: "Dan Andrews" }))
        .toBeVisible();
      await input.fill("Ann");
      await userEvent.keyboard("{ArrowDown}");
      expect(input).not.toHaveAttribute("aria-activedescendant");
      await userEvent.keyboard("{Enter}");
      await expect.element(input).toHaveValue("Ann");
      await expect
        .element(screen.getByTestId("picked"))
        .toHaveTextContent("none");
    });

    test("while searching, a click doesn't pick from the last list", async () => {
      const held = heldSearch();
      const screen = await renderIn("light", Picker, { options: held.search });
      const input = screen.getByRole("combobox");
      await input.fill("Dan");
      held.answer("Dan");
      const dan = screen.getByRole("option", { name: "Dan Andrews" });
      await expect.element(dan).toBeVisible();
      await input.fill("Ann");
      await dan.click();
      await expect.element(input).toHaveValue("Ann");
      await expect
        .element(screen.getByTestId("picked"))
        .toHaveTextContent("none");
    });

    test("ignores an answer that comes back after a newer one", async () => {
      const held = heldSearch();
      const screen = await renderIn("light", Picker, { options: held.search });
      const input = screen.getByRole("combobox");
      await userEvent.click(input);
      await userEvent.keyboard("A");
      await userEvent.keyboard("r");
      held.answer("Ar");
      await expect
        .element(screen.getByRole("option", { name: "Ann Archer" }))
        .toBeVisible();
      held.answer("A");
      await settled();
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

  test("required, its form is invalid until an option is picked", async () => {
    const screen = await renderIn("light", Picker, { required: true });
    const input = screen.getByRole("combobox");
    const form = input.element().closest("form")!;
    expect(form.checkValidity()).toBe(false);
    // Text that matches an option is still not a pick.
    await input.fill("Ann Archer");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => form.checkValidity()).toBe(false);
    expect((input.element() as HTMLInputElement).validationMessage).not.toBe(
      "",
    );
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect.element(input).toHaveValue("Ann Archer");
    await expect.poll(() => form.checkValidity()).toBe(true);
  });

  test("a form reset clears the box and the pick it sends", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    const form = input.element().closest("form")!;
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect.element(input).toHaveValue("Ann Archer");
    expect(new FormData(form).get("controller")).toBe("1000001");
    form.reset();
    await expect.element(input).toHaveValue("");
    await expect
      .element(screen.getByTestId("picked"))
      .toHaveTextContent("none");
    expect(new FormData(form).get("controller")).toBe("");
    expect(form.checkValidity()).toBe(true);
  });

  test("a form reset closes the open list", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    input.element().closest("form")!.reset();
    await expect.element(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  test("a reset the page cancels keeps the pick", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    const form = input.element().closest("form")!;
    form.addEventListener("reset", (event) => event.preventDefault());
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    form.reset();
    await settled();
    await expect.element(input).toHaveValue("Ann Archer");
    expect(new FormData(form).get("controller")).toBe("1000001");
  });

  describe("with a defaultValue", () => {
    const ann = { cid: "1000001", name: "Ann Archer" };
    const ben = { cid: "1000002", name: "Ben Baker" };

    test("starts on it when no value is given", async () => {
      const screen = await renderIn("light", Picker, { defaultValue: ben });
      const input = screen.getByRole("combobox");
      await expect.element(input).toHaveValue("Ben Baker");
      await expect
        .element(screen.getByTestId("picked"))
        .toHaveTextContent("1000002");
      const form = input.element().closest("form")!;
      expect(new FormData(form).get("controller")).toBe("1000002");
    });

    test("a given value comes first", async () => {
      const screen = await renderIn("light", Picker, {
        value: ann,
        defaultValue: ben,
      });
      await expect
        .element(screen.getByRole("combobox"))
        .toHaveValue("Ann Archer");
    });

    test("a form reset goes back to it", async () => {
      const screen = await renderIn("light", Picker, {
        value: ann,
        defaultValue: ben,
      });
      const input = screen.getByRole("combobox");
      const form = input.element().closest("form")!;
      await input.fill("Car");
      await userEvent.keyboard("{ArrowDown}{Enter}");
      await expect.element(input).toHaveValue("Cara Cole");
      form.reset();
      await expect.element(input).toHaveValue("Ben Baker");
      await expect
        .element(screen.getByTestId("picked"))
        .toHaveTextContent("1000002");
      expect(new FormData(form).get("controller")).toBe("1000002");
      expect(form.checkValidity()).toBe(true);
    });

    test("a form reset goes back to it as it is now", async () => {
      const screen = await renderIn("light", Picker, { defaultValue: ann });
      const input = screen.getByRole("combobox");
      await screen.rerender({ defaultValue: ben });
      input.element().closest("form")!.reset();
      await expect.element(input).toHaveValue("Ben Baker");
    });
  });

  test("not required, text with no pick fails the form; an empty box passes", async () => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    const form = input.element().closest("form")!;
    expect(form.checkValidity()).toBe(true);
    await input.fill("Ann");
    await expect.poll(() => form.checkValidity()).toBe(false);
    await input.fill("");
    await expect.poll(() => form.checkValidity()).toBe(true);
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

  test.each([
    ["by keyboard", "{ArrowDown}{Enter}"],
    ["by mouse", null],
  ])("announces the same option picked again, %s", async (_, keys) => {
    const screen = await renderIn("light", Picker, {});
    const input = screen.getByRole("combobox");
    const status = screen.getByRole("status").element();
    const said: string[] = [];
    new MutationObserver(() => said.push(status.textContent ?? "")).observe(
      status,
      { childList: true, characterData: true, subtree: true },
    );
    for (let time = 0; time < 2; time++) {
      if (keys) {
        await userEvent.click(input);
        await userEvent.keyboard("{Escape}");
        await userEvent.keyboard(keys);
      } else {
        await input.click();
        await screen.getByRole("option", { name: "Ann Archer" }).click();
      }
      await expect.element(input).toHaveValue("Ann Archer");
    }
    // Each pick is new text in the region, so it is read out each time.
    await expect
      .poll(() => said.filter((text) => text === "Ann Archer, selected"))
      .toHaveLength(2);
  });
});
