import { describe, expect, test } from "vitest";
import { choiceLabelId, describedBy, descriptionIds } from "./formControl.ts";

describe("descriptionIds", () => {
  test("gives the hint and error ids from one base id", () => {
    expect(descriptionIds("f1")).toEqual({
      hint: "f1-hint",
      error: "f1-error",
    });
  });
});

describe("choiceLabelId", () => {
  test("gives the label's id from the base id", () => {
    expect(choiceLabelId("f1")).toBe("f1-label");
  });
});

describe("describedBy", () => {
  // A Checkbox's or Radio's children count as its hint, so `hint` is any
  // truthy value, not only a string.
  test.each([
    [{}, undefined, undefined],
    [{ hint: "", error: "" }, null, undefined],
    [{ hint: "Hint" }, undefined, "f1-hint"],
    [{ error: "Error" }, undefined, "f1-error"],
    [{ hint: "Hint", error: "Error" }, undefined, "f1-hint f1-error"],
    [{ hint: () => {} }, undefined, "f1-hint"],
    [{}, "intro", "intro"],
    [{ hint: "Hint" }, "intro", "intro f1-hint"],
    [
      { hint: "Hint", error: "Error" },
      "intro note",
      "intro note f1-hint f1-error",
    ],
  ])("%o after the caller's %s is %s", (shown, callers, ids) => {
    expect(describedBy("f1", shown, callers)).toBe(ids);
  });
});
