// Type tests: `expectTypeOf` fails `npm run check` (svelte-check), not the
// run, which only shows they exist. In the node project as they need no
// DOM. The app's own position type, as it reads the CMS catalogue, goes in
// and comes back out with its other fields.
import { describe, expectTypeOf, test } from "vitest";
import { groupByPosition } from "../aviation/groupByPosition.ts";
import { indyCenter } from "../../playground/positions.ts";
import { getPositions, setPositions } from "./positionsContext.ts";

/** Stands for an app's copy of the catalogue's position. */
type AppPosition = typeof indyCenter & {
  facility: { id: string; name: string };
  starred: boolean;
  requiredCredentials: { anyOf: string[] }[];
};

const fromCms: AppPosition = {
  ...indyCenter,
  facility: { id: "ZID", name: "Indianapolis ARTCC" },
  starred: true,
  requiredCredentials: [{ anyOf: ["E-RC"] }, { anyOf: ["T2-CTR"] }],
};

describe("an app's own position type", () => {
  test("goes into setPositions as it is", () => {
    expectTypeOf(setPositions<AppPosition>)
      .parameter(0)
      .toEqualTypeOf<() => readonly AppPosition[]>();
    expectTypeOf(setPositions).toBeCallableWith(() => [fromCms]);
  });

  test("comes back from getPositions when named", () => {
    expectTypeOf(getPositions<AppPosition>).returns.toEqualTypeOf<
      () => readonly AppPosition[]
    >();
  });

  test("comes back from groupByPosition", () => {
    const [group] = groupByPosition([{ callsign: "IND_83_CTR" }], [fromCms]);
    expectTypeOf(group.position).toEqualTypeOf<AppPosition | undefined>();
    expectTypeOf(group.position!.requiredCredentials).toEqualTypeOf<
      { anyOf: string[] }[]
    >();
  });
});
