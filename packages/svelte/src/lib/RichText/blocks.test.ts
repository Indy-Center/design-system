// The type test: each block's field type, from the `blocks` entry, fits
// its component's props once RichText has cleaned it. `svelte-check`
// (`npm run check`) is what fails on a mismatch; the test run only loads
// the file. Each block the package draws adds one line to the first test,
// alphabetical:
//
//   expectTypeOf<AsProps<CalloutBlock>>().toExtend<ComponentProps<typeof Callout>>();
//
// A block whose component takes something other than its fields (a
// snippet for a text field) maps that field in its line, and says why.
import type { ComponentProps, Snippet } from "svelte";
import { describe, expectTypeOf, test } from "vitest";
import { BLOCKS, type BlockFieldTypes } from "../blocks.ts";
import Link from "../Link/Link.svelte";
import type { BlockProps, BlockSnippets } from "./blockSnippets.ts";
import type { RichTextState } from "./nodes.ts";
import { PACKAGE_BLOCKS } from "./packageBlocks.svelte";

/**
 * Fields `F` as the component gets them from its snippet: cleaned by
 * RichText, with the drawn `content` as the component's `children`.
 */
type AsProps<F> = Omit<BlockProps<F>, "content"> &
  ("content" extends keyof F ? { children: Snippet } : unknown);

describe("each block's fields fit its component's props", () => {
  test("the package's blocks", () => {
    // One line per block, alphabetical (see the top of this file).
    expectTypeOf(BLOCKS).toExtend<
      Record<keyof BlockFieldTypes, "block" | "inline">
    >();
  });

  // The check itself, on a made-up block drawn by Link: content becomes
  // children, and a wrong or missing field fails.
  test("the check passes a fit and catches a wrong type and a missing prop", () => {
    type LinkBlock = { href: string; content: RichTextState };
    expectTypeOf<AsProps<LinkBlock>>().toExtend<ComponentProps<typeof Link>>();
    expectTypeOf<
      AsProps<{ href: number; content: RichTextState }>
    >().not.toExtend<ComponentProps<typeof Link>>();
    expectTypeOf<AsProps<{ content: RichTextState }>>().not.toExtend<
      ComponentProps<typeof Link>
    >();
    expectTypeOf<AsProps<{ href: string }>>().not.toExtend<
      ComponentProps<typeof Link>
    >();
  });

  test("a field Payload can leave null reaches the snippet as undefined, at any depth", () => {
    type Fields = {
      label?: string | null;
      airport: { code: string | null } | null;
      show: ("airport" | null)[];
      content?: RichTextState | null;
    };
    expectTypeOf<BlockProps<Fields>>().toEqualTypeOf<{
      label?: string | undefined;
      airport: { code: string | undefined } | undefined;
      show: ("airport" | undefined)[];
      content?: Snippet | undefined;
    }>();
  });
});

describe("the package fills its own slugs", () => {
  test("with a snippet for each, taking its fields", () => {
    expectTypeOf(PACKAGE_BLOCKS).toExtend<{
      [Slug in keyof BlockFieldTypes]: Snippet<
        [BlockProps<BlockFieldTypes[Slug]>]
      >;
    }>();
    expectTypeOf(PACKAGE_BLOCKS).toExtend<BlockSnippets>();
  });
});
