import { describe, expect, test } from "vitest";

describe("the server entry point", () => {
  // This file runs in Chromium.
  test("refuses to load in the browser", async () => {
    await expect(import("./server.ts")).rejects.toThrow(
      /@indy-center\/centerline-svelte\/server is for server code/,
    );
  });
});
