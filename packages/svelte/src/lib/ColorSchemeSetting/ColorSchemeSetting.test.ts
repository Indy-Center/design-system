import { afterEach, describe, expect, test, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { forgetColorScheme } from "../../playground/forgetColorScheme.ts";
import { COOKIE_NAME } from "../colorScheme/colorScheme.ts";
import { saveColorScheme } from "../colorScheme/saveColorScheme.ts";
import ColorSchemeSetting from "./ColorSchemeSetting.svelte";
import Layout from "./ColorSchemeSetting.test.svelte";

afterEach(async () => {
  forgetColorScheme();
  await commands.emulateColorScheme(null);
});

/** The saved choice, as the next request would carry it. */
function saved() {
  return document.cookie
    .split("; ")
    .find((pair) => pair.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
}

const DEVICE = "Use my device's setting";

/** Placed under the hook's `fallback: 'device'`, as phase 2's apps will. */
const device = { fallback: "device" } as const;

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

  test("works from the keyboard", async () => {
    await renderIn("light", Layout, device);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(saved()).toBe("light");
  });

  test("What's saved? shows the note", async () => {
    const screen = await renderIn("light", Layout, device);
    const button = screen.getByRole("button", { name: "What's saved?" });
    await expect.element(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect
      .element(screen.getByText(/^Saved on this browser/))
      .toHaveTextContent(
        "Saved on this browser for a year, across flyindycenter.com.",
      );
  });

  test.each(SCHEMES)("its colours follow the roles (%s)", async (scheme) => {
    const screen = await renderIn(scheme, Layout, device);
    await expect
      .element(screen.getByRole("button", { name: DEVICE }))
      .toHaveStyle({
        color: role("foreground", scheme),
        backgroundColor: role("muted", scheme),
      });
    await expect
      .element(screen.getByRole("button", { name: "Light" }))
      .toHaveStyle({ color: role("foreground-soft", scheme) });
  });

  test("every row is at least 44px tall", async () => {
    const screen = await renderIn("light", Layout, device);
    for (const name of ["Light", "Dark", DEVICE, "What's saved?"]) {
      const box = screen
        .getByRole("button", { name, exact: true })
        .element()
        .getBoundingClientRect();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
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

  test("there is no device row: the next page would be dark anyway", async () => {
    const screen = await renderIn("dark", Layout, dark);
    const group = screen.getByRole("group", { name: "Colour scheme" });
    for (const name of ["Light", "Dark"]) {
      await expect
        .element(group.getByRole("button", { name, exact: true }))
        .toBeInTheDocument();
    }
    await expect
      .element(group.getByRole("button", { name: DEVICE }))
      .not.toBeInTheDocument();
  });

  test("with nothing saved, Dark is ticked, as served", async () => {
    const screen = await renderIn("dark", Layout, dark);
    await expect
      .element(screen.getByRole("button", { name: "Dark" }))
      .toHaveAttribute("aria-pressed", "true");
    await expect
      .element(screen.getByRole("button", { name: "Light" }))
      .toHaveAttribute("aria-pressed", "false");
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
    // The test page isn't on flyindycenter.com; its own host stands in.
    const screen = await renderIn("light", Layout, {
      ...device,
      domain: location.hostname,
    });
    await screen.getByRole("button", { name: "Light" }).click();
    await screen.getByRole("button", { name: DEVICE }).click();
    const domain = expect.stringContaining(`; Domain=${location.hostname}`);
    expect(written).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`^${COOKIE_NAME}=light;`)),
    );
    expect(written).toHaveBeenCalledTimes(2);
    expect(written).toHaveBeenNthCalledWith(1, domain);
    expect(written).toHaveBeenNthCalledWith(2, domain);
    written.mockRestore();
  });
});
