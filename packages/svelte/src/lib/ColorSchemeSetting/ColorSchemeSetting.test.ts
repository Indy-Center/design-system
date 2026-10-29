import { afterEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { commands } from "vitest/browser";
import { savedColorScheme as saved } from "../../../test/cookies.ts";
import { renderIn } from "../../../test/schemes.ts";
import { forgetColorScheme } from "../../playground/forgetColorScheme.ts";
import { saveColorScheme } from "../colorScheme/saveColorScheme.ts";
import ColorSchemeSetting from "./ColorSchemeSetting.svelte";
import Layout from "./ColorSchemeSetting.test.svelte";

afterEach(async () => {
  forgetColorScheme();
  await commands.emulateColorScheme(null);
});

const DEVICE = "Use my device's setting";

/** Placed under the hook's `fallback: 'device'`, as phase 2's apps will. */
const device = { fallback: "device" } as const;

// The rows' and the note's looks are preferenceControl's (its own tests),
// and the cookie's attributes preferenceCookie's.
describe("ColorSchemeSetting", () => {
  test("is a group of three choices, named Colour scheme", async () => {
    const screen = await renderIn("light", Layout, device);
    const group = screen.getByRole("group", { name: "Colour scheme" });
    for (const name of ["Light", "Dark", DEVICE]) {
      await expect
        .element(group.getByRole("button", { name, exact: true }))
        .toBeInTheDocument();
    }
  });

  test("with nothing saved, the device's setting is ticked", async () => {
    const screen = await renderIn("light", Layout, device);
    await expect
      .element(screen.getByRole("button", { name: DEVICE }))
      .toHaveAttribute("aria-pressed", "true");
    await expect
      .element(screen.getByRole("button", { name: "Light" }))
      .toHaveAttribute("aria-pressed", "false");
  });

  test("a saved choice is ticked", async () => {
    saveColorScheme("dark");
    delete document.documentElement.dataset.theme;
    const screen = await renderIn("light", Layout, device);
    await expect
      .element(screen.getByRole("button", { name: "Dark" }))
      .toHaveAttribute("aria-pressed", "true");
  });

  test("light or dark is saved and applied at once", async () => {
    const screen = await renderIn("light", Layout, device);
    await screen.getByRole("button", { name: "Dark" }).click();
    await expect
      .element(screen.getByRole("button", { name: "Dark" }))
      .toHaveAttribute("aria-pressed", "true");
    expect(saved()).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  test("the device's setting deletes the saved choice and applies the device's", async () => {
    await commands.emulateColorScheme("dark");
    saveColorScheme("light");
    const screen = await renderIn("light", Layout, device);
    await screen.getByRole("button", { name: DEVICE }).click();
    await expect
      .element(screen.getByRole("button", { name: DEVICE }))
      .toHaveAttribute("aria-pressed", "true");
    expect(saved()).toBeUndefined();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  test("two on one page stay in step", async () => {
    const screen = await renderIn("light", Layout, { ...device, count: 2 });
    const [first, second] = screen.getByRole("button", { name: "Light" }).all();
    await first.click();
    await expect.element(second).toHaveAttribute("aria-pressed", "true");
  });

  test("What's saved? shows the note", async () => {
    const screen = await renderIn("light", Layout, device);
    await screen.getByRole("button", { name: "What's saved?" }).click();
    await expect
      .element(screen.getByText(/^Saved on this browser/))
      .toHaveTextContent(
        "Saved on this browser for a year, across flyindycenter.com.",
      );
  });

  test("adds a caller's class to the group", async () => {
    const screen = await renderIn("light", ColorSchemeSetting, {
      class: "ml-4",
    });
    await expect
      .element(screen.getByRole("group", { name: "Colour scheme" }))
      .toHaveStyle({ marginLeft: "16px" });
  });
});

describe("under the hook's fallback: 'dark' (phase 1)", () => {
  const dark = { fallback: "dark" } as const;

  test("there is no device row, and with nothing saved Dark is ticked, as served", async () => {
    const screen = await renderIn("dark", Layout, dark);
    const group = screen.getByRole("group", { name: "Colour scheme" });
    await expect
      .element(group.getByRole("button", { name: "Dark" }))
      .toHaveAttribute("aria-pressed", "true");
    await expect
      .element(group.getByRole("button", { name: "Light" }))
      .toHaveAttribute("aria-pressed", "false");
    await expect
      .element(group.getByRole("button", { name: DEVICE }))
      .not.toBeInTheDocument();
  });

  test("light or dark still saves", async () => {
    const screen = await renderIn("dark", Layout, dark);
    await screen.getByRole("button", { name: "Light" }).click();
    expect(saved()).toBe("light");
    await expect
      .element(screen.getByRole("button", { name: "Light" }))
      .toHaveAttribute("aria-pressed", "true");
  });

  test("without setColorScheme, the control takes phase 1's dark", async () => {
    const screen = await renderIn("dark", ColorSchemeSetting, {});
    await expect
      .element(screen.getByRole("button", { name: "Dark" }))
      .toHaveAttribute("aria-pressed", "true");
    await expect
      .element(screen.getByRole("button", { name: DEVICE }))
      .not.toBeInTheDocument();
  });
});

describe("the cookie's domain", () => {
  test("comes from setColorScheme, for saving and deleting", async () => {
    // Chrome stores Domain=localhost as host-only, so read what is written.
    const written = vi.spyOn(Document.prototype, "cookie", "set");
    onTestFinished(() => written.mockRestore());
    // The test page isn't on flyindycenter.com; its own host stands in.
    const screen = await renderIn("light", Layout, {
      ...device,
      domain: location.hostname,
    });
    await screen.getByRole("button", { name: "Light" }).click();
    await screen.getByRole("button", { name: DEVICE }).click();
    const domain = expect.stringContaining(`; Domain=${location.hostname}`);
    expect(written).toHaveBeenCalledTimes(2);
    expect(written).toHaveBeenNthCalledWith(1, domain);
    expect(written).toHaveBeenNthCalledWith(2, domain);
  });
});
