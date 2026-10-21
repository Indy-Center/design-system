import { expect, test } from "vitest";
import { withoutTrailingSlash } from "./withoutTrailingSlash.ts";

test.each([
  ["/events/", "/events"],
  ["/events", "/events"],
  ["/events//", "/events"],
  ["https://x.example/", "https://x.example"],
  ["https://x.example", "https://x.example"],
  ["/", "/"],
])("withoutTrailingSlash(%j) is %j", (url, expected) => {
  expect(withoutTrailingSlash(url)).toBe(expected);
});
