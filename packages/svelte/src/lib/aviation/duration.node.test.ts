import { describe, expect, test } from "vitest";
import { formatDuration } from "./duration.ts";

describe("formatDuration", () => {
  test.each([
    [83, "1 h 23 m"],
    [120, "2 h"],
    [45, "45 m"],
    [0, "0 m"],
    [1500, "25 h"],
  ])("%d minutes, short, is %s", (minutes, text) => {
    expect(formatDuration(minutes, "short")).toBe(text);
  });

  test.each([
    [83, "1 hour 23 minutes"],
    [61, "1 hour 1 minute"],
    [120, "2 hours"],
    [1, "1 minute"],
    [0, "0 minutes"],
  ])("%d minutes, long, is %s", (minutes, text) => {
    expect(formatDuration(minutes, "long")).toBe(text);
  });

  test.each([
    [83, "1:23"],
    [5, "0:05"],
    [600, "10:00"],
  ])("%d minutes, clock (VATUSA's HH:MM), is %s", (minutes, text) => {
    expect(formatDuration(minutes, "clock")).toBe(text);
  });

  test("rounds to the minute", () => {
    expect(formatDuration(82.6, "short")).toBe("1 h 23 m");
  });

  test("gives the length either way round", () => {
    expect(formatDuration(-83, "short")).toBe("1 h 23 m");
  });
});
