// What a block's snippet gets: the types between the `blocks` entry's field
// types (plain JSON, for the CMS) and the Svelte side.
import type { Snippet } from "svelte";
import type { BlockFieldTypes, BlockSlug } from "../blocks.js";

/** `T` with every `null` in it, at any depth, as `undefined`. */
export type WithoutNulls<T> = T extends null
  ? undefined
  : T extends readonly unknown[]
    ? { [I in keyof T]: WithoutNulls<T[I]> }
    : T extends object
      ? { [K in keyof T]: WithoutNulls<T[K]> }
      : T;

/**
 * What a block's snippet gets for fields `F`: `null` as `undefined`, and
 * `content` (nested rich text) as a snippet that draws it.
 */
export type BlockProps<F> = {
  [K in keyof F]: K extends "content"
    ? null extends F[K]
      ? Snippet | undefined
      : Snippet
    : WithoutNulls<F[K]>;
};

/**
 * RichText's `blocks`: a snippet per slug. The package's own slugs are
 * typed by their fields; an app's own slug takes whatever its snippet
 * declares.
 */
export type BlockSnippets = {
  [Slug in BlockSlug]?: Snippet<[BlockProps<BlockFieldTypes[Slug]>]>;
} & {
  // An app's own blocks, whose fields the package can't know: `any`, so
  // the app's snippet can name its own field type.
  [slug: string]: Snippet<[any]> | undefined;
};
