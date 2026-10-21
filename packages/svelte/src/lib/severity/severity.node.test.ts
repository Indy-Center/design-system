import {
  mdiAlertOctagonOutline,
  mdiAlertOutline,
  mdiCheckCircleOutline,
  mdiInformationOutline,
} from "@mdi/js";
import { expect, test } from "vitest";
import { SEVERITIES } from "./severity.ts";

// From the component list's severity scale: least to most important, each
// read out by its label, drawn in its role and with its own icon.
test("the severity scale's levels, in order, with their rank, label, role, announcement and icon", () => {
  expect(
    Object.entries(SEVERITIES).map(([level, s]) => [
      level,
      s.rank,
      s.label,
      s.role,
      s.live,
      s.icon,
    ]),
  ).toEqual([
    ["info", 0, "Info", "info", "status", mdiInformationOutline],
    ["success", 1, "Success", "success", "status", mdiCheckCircleOutline],
    ["caution", 2, "Caution", "warning", "status", mdiAlertOutline],
    ["danger", 3, "Danger", "destructive", "alert", mdiAlertOctagonOutline],
  ]);
});
