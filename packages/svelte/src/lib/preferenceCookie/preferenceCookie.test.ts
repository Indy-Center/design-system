import { afterEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { storedCookie } from "../../../test/cookies.ts";
import {
  deletePreferenceCookie,
  readPreferenceCookie,
  writePreferenceCookie,
} from "./preferenceCookie.ts";

const NAME = "indy-test-preference";
const YEAR = 365 * 24 * 60 * 60;

afterEach(() => {
  document.cookie = `${NAME}=; Path=/; Max-Age=0`;
});

/** What the page writes to `document.cookie` while `run` runs. */
function written(run: () => void): string[] {
  // Chrome stores Domain=localhost as host-only, so read what is written.
  const setter = vi.spyOn(Document.prototype, "cookie", "set");
  onTestFinished(() => setter.mockRestore());
  run();
  return setter.mock.calls.map(([cookie]) => cookie);
}

describe("writePreferenceCookie", () => {
  test("keeps the value for a year, on every path, sent with links in", async () => {
    writePreferenceCookie(NAME, "dark");
    const cookie = await storedCookie(NAME);
    expect(cookie).toMatchObject({ value: "dark", path: "/", sameSite: "Lax" });
    expect(cookie?.expires).toBeGreaterThan(Date.now() / 1000 + YEAR - 60);
  });

  test("shares it across the given domain, on its sites", () => {
    // The test page isn't on flyindycenter.com; its own host stands in.
    const domain = location.hostname;
    expect(
      written(() => writePreferenceCookie(NAME, "dark", { domain })),
    ).toEqual([
      `${NAME}=dark; Path=/; Max-Age=${YEAR}; SameSite=Lax; Domain=${domain}`,
    ]);
  });

  test("leaves the domain off where the page isn't on it, such as localhost", async () => {
    writePreferenceCookie(NAME, "dark");
    expect((await storedCookie(NAME))?.domain).toBe(location.hostname);
  });
});

describe("deletePreferenceCookie", () => {
  test("deletes the cookie written", async () => {
    writePreferenceCookie(NAME, "dark");
    deletePreferenceCookie(NAME);
    expect(await storedCookie(NAME)).toBeUndefined();
  });

  test("deletes it on the domain it was written on", () => {
    const domain = location.hostname;
    expect(written(() => deletePreferenceCookie(NAME, { domain }))).toEqual([
      `${NAME}=; Path=/; Max-Age=0; SameSite=Lax; Domain=${domain}`,
    ]);
  });
});

describe("readPreferenceCookie", () => {
  test("reads the value the page holds, or none", () => {
    document.cookie = `other-${NAME}=1; Path=/`;
    onTestFinished(() => {
      document.cookie = `other-${NAME}=; Path=/; Max-Age=0`;
    });
    expect(readPreferenceCookie(NAME)).toBeUndefined();
    writePreferenceCookie(NAME, "dark");
    expect(readPreferenceCookie(NAME)).toBe("dark");
  });
});
