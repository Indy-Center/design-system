import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createPositionsFetcher } from "./fetchPositions.ts";

// The parts of Data Admin's 1 MB reply the lookup reads, with a few it
// drops, shaped as https://data-api.vnas.vatsim.net/api/artccs/ZID was on
// 2026-10-20.
function artcc(lastUpdatedAt: string, centerName = "Falmouth 83") {
  return {
    id: "ZID",
    lastUpdatedAt,
    videoMaps: [{ id: "map" }],
    facility: {
      id: "ZID",
      type: "Artcc",
      name: "Indianapolis ARTCC",
      positions: [
        {
          id: "01GFTXMTZDDJ9XKMJ7AX0EXKQF",
          name: centerName,
          starred: true,
          radioName: "Indy Center",
          callsign: "IND_83_CTR",
          frequency: 128225000,
          eramConfiguration: { sectorId: "83" },
          transceiverIds: ["fdf362b9"],
        },
      ],
      childFacilities: [
        {
          id: "CVG",
          type: "AtctTracon",
          name: "Cincinnati TRACON",
          positions: [
            {
              id: "cvg-app",
              name: "Wildcat Departure Radar",
              starred: false,
              radioName: "Cincinnati  Approach",
              callsign: "CVG_W_APP",
              frequency: 119700000,
              transceiverIds: [],
            },
          ],
          childFacilities: [
            {
              id: "LUK",
              type: "Atct",
              name: "Lunken Tower",
              positions: [
                {
                  id: "luk-gnd",
                  name: "Ground Control",
                  starred: true,
                  radioName: "Lunken Ground ",
                  callsign: "LUK_GND",
                  frequency: 121900000,
                },
              ],
              childFacilities: [],
            },
          ],
        },
      ],
    },
  };
}

/** A fake `fetch` that answers each request with the next body, and counts. */
function fakeFetch(...bodies: unknown[]) {
  const urls: string[] = [];
  const fetch = async (input: RequestInfo | URL) => {
    urls.push(String(input));
    const body = bodies[Math.min(urls.length, bodies.length) - 1];
    if (body instanceof Error) throw body;
    if (body instanceof Response) return body;
    return Response.json(body);
  };
  return { fetch: fetch as typeof globalThis.fetch, urls };
}

describe("createPositionsFetcher", () => {
  test("slims an ARTCC's positions, its TRACONs' and towers' included", async () => {
    const { fetch, urls } = fakeFetch(artcc("2026-10-17T02:35:43.475Z"));
    const fetchPositions = createPositionsFetcher({ fetch });

    expect(await fetchPositions("ZID")).toEqual([
      {
        id: "01GFTXMTZDDJ9XKMJ7AX0EXKQF",
        callsign: "IND_83_CTR",
        name: "Falmouth 83",
        radioName: "Indy Center",
        frequency: 128225000,
        facility: "Indianapolis ARTCC",
        starred: true,
      },
      {
        id: "cvg-app",
        callsign: "CVG_W_APP",
        name: "Wildcat Departure Radar",
        radioName: "Cincinnati Approach",
        frequency: 119700000,
        facility: "Cincinnati TRACON",
        starred: false,
      },
      {
        id: "luk-gnd",
        callsign: "LUK_GND",
        name: "Ground Control",
        radioName: "Lunken Ground",
        frequency: 121900000,
        facility: "Lunken Tower",
        starred: true,
      },
    ]);
    expect(urls).toEqual(["https://data-api.vnas.vatsim.net/api/artccs/ZID"]);
  });

  test("makes one request for many callers, together and later", async () => {
    const { fetch, urls } = fakeFetch(artcc("2026-10-17T02:35:43.475Z"));
    const fetchPositions = createPositionsFetcher({ fetch });

    const together = await Promise.all(
      Array.from({ length: 300 }, () => fetchPositions("ZID")),
    );
    const later = await fetchPositions("ZID");

    expect(urls).toHaveLength(1);
    expect(together[0]).toHaveLength(3);
    for (const positions of [...together, later]) {
      expect(positions).toBe(together[0]);
    }
  });

  test("checks again after an hour, and takes the new positions when lastUpdatedAt changed", async () => {
    const { fetch, urls } = fakeFetch(
      artcc("2026-10-17T02:35:43.475Z"),
      artcc("2026-10-20T09:00:00.000Z", "Falmouth 83 Low"),
    );
    let now = Date.UTC(2026, 9, 20, 12);
    const fetchPositions = createPositionsFetcher({ fetch, now: () => now });

    const first = await fetchPositions("ZID");
    now += 59 * 60_000;
    expect(await fetchPositions("ZID")).toBe(first);
    expect(urls).toHaveLength(1);

    now += 2 * 60_000;
    const second = await fetchPositions("ZID");
    expect(urls).toHaveLength(2);
    expect(second[0]?.name).toBe("Falmouth 83 Low");
  });

  test("keeps the same positions when lastUpdatedAt hasn't changed", async () => {
    const { fetch, urls } = fakeFetch(artcc("2026-10-17T02:35:43.475Z"));
    let now = Date.UTC(2026, 9, 20, 12);
    const fetchPositions = createPositionsFetcher({ fetch, now: () => now });

    const first = await fetchPositions("ZID");
    now += 61 * 60_000;
    expect(await fetchPositions("ZID")).toBe(first);
    expect(urls).toHaveLength(2);
    // Checked, so the next hour is quiet again.
    now += 30 * 60_000;
    await fetchPositions("ZID");
    expect(urls).toHaveLength(2);
  });

  test("checks as often as maxAge says", async () => {
    const { fetch, urls } = fakeFetch(artcc("2026-10-17T02:35:43.475Z"));
    let now = Date.UTC(2026, 9, 20, 12);
    const fetchPositions = createPositionsFetcher({
      fetch,
      now: () => now,
      maxAge: 60_000,
    });

    await fetchPositions("ZID");
    now += 61_000;
    await fetchPositions("ZID");
    expect(urls).toHaveLength(2);
  });

  describe("when Data Admin fails", () => {
    let errors: unknown[][];
    beforeEach(() => {
      errors = [];
      vi.spyOn(console, "error").mockImplementation((...args) => {
        errors.push(args);
      });
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    test.each([
      ["the request fails", new TypeError("fetch failed")],
      [
        "it answers with an error",
        new Response("Bad gateway", { status: 502 }),
      ],
      ["it answers with something else", { message: "Not found" }],
    ])(
      "with no copy, gives no positions when %s, and logs it",
      async (_, failure) => {
        const { fetch } = fakeFetch(failure);
        const fetchPositions = createPositionsFetcher({ fetch });

        expect(await fetchPositions("ZID")).toEqual([]);
        expect(errors).toHaveLength(1);
      },
    );

    test("keeps the copy it has", async () => {
      const { fetch } = fakeFetch(
        artcc("2026-10-17T02:35:43.475Z"),
        new TypeError("fetch failed"),
      );
      let now = Date.UTC(2026, 9, 20, 12);
      const fetchPositions = createPositionsFetcher({ fetch, now: () => now });

      const first = await fetchPositions("ZID");
      now += 61 * 60_000;
      expect(await fetchPositions("ZID")).toBe(first);
    });

    test("tries again after a minute, not on every call", async () => {
      const { fetch, urls } = fakeFetch(
        new TypeError("fetch failed"),
        artcc("2026-10-17T02:35:43.475Z"),
      );
      let now = Date.UTC(2026, 9, 20, 12);
      const fetchPositions = createPositionsFetcher({ fetch, now: () => now });

      await fetchPositions("ZID");
      now += 59_000;
      expect(await fetchPositions("ZID")).toEqual([]);
      expect(urls).toHaveLength(1);

      now += 2_000;
      expect(await fetchPositions("ZID")).toHaveLength(3);
      expect(urls).toHaveLength(2);
    });
  });

  test("keeps each ARTCC apart", async () => {
    const { fetch, urls } = fakeFetch(artcc("2026-10-17T02:35:43.475Z"));
    const fetchPositions = createPositionsFetcher({ fetch });

    await Promise.all([fetchPositions("ZID"), fetchPositions("ZAU")]);
    await fetchPositions("ZAU");

    expect(urls).toEqual([
      "https://data-api.vnas.vatsim.net/api/artccs/ZID",
      "https://data-api.vnas.vatsim.net/api/artccs/ZAU",
    ]);
  });
});
