import { expect, test } from "vitest";
import { confirmAction } from "./confirmAction.ts";

// On the server there is no member to ask, and no page to mount on.
test("resolves false at once on the server", async () => {
  await expect(
    confirmAction({ title: "Delete event?", message: "It can't be undone." }),
  ).resolves.toBe(false);
});
