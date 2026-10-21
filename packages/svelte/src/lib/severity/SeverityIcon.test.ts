import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import SeverityIcon from "./SeverityIcon.svelte";
import { SEVERITIES, type Severity } from "./severity.ts";

describe("SeverityIcon", () => {
  test.each(Object.keys(SEVERITIES) as Severity[])(
    "%s draws its own icon, 20px, filled in its role, hidden from readers",
    async (level) => {
      const screen = await renderIn("light", SeverityIcon, { level });
      const svg = screen.container.querySelector("svg")!;
      expect(svg.querySelector("path")!.getAttribute("d")).toBe(
        SEVERITIES[level].icon,
      );
      expect(svg.getAttribute("aria-hidden")).toBe("true");
      await expect.element(svg).toHaveStyle({ width: "20px", height: "20px" });
      await expect
        .element(svg.querySelector("path")!)
        .toHaveStyle({ fill: role(SEVERITIES[level].role, "light") });
    },
  );
});
