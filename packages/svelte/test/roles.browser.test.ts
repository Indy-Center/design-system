import { expect, test } from "vitest";
import { computedColour } from "./roles.ts";

test("computedColour matches getComputedStyle for every alpha", () => {
  const el = document.createElement("div");
  document.body.append(el);
  try {
    for (let alpha = 0; alpha < 256; alpha++) {
      const hex = `#334155${alpha.toString(16).padStart(2, "0")}`;
      el.style.color = hex;
      expect(getComputedStyle(el).color, hex).toBe(computedColour(hex));
    }
  } finally {
    el.remove();
  }
});
