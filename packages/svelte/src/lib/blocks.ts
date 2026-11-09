// The blocks contract, for Payload's block configs:
// import { BLOCKS, type BlockFieldTypes } from "@indy-center/centerline-svelte/blocks";
//
// Plain TypeScript with no Svelte import, so the CMS reads it with no
// Svelte installed. Each block the package draws adds, in alphabetical
// order: its field type, a line in `BlockFieldTypes`, a line in `BLOCKS`,
// any option lists its selects need, a snippet in
// `RichText/packageBlocks.svelte`, a check in `RichText/blocks.test.ts` and
// a row in `RichText/RichText.md`'s Blocks section.
import { PILOT_RATINGS, RATINGS } from "./aviation/ratings.js";
import {
  FLIGHT_CATEGORIES,
  type FlightCategoryCode,
} from "./FlightCategory/categories.js";
import {
  POSITION_FIELDS,
  type PositionField,
} from "./Position/positionFields.js";
import type { RichTextState } from "./RichText/nodes.js";

export type { RichTextState };

/** Where a block sits: on a line of its own, or inline in a paragraph. */
export type BlockKind = "block" | "inline";

/** A callout: a note set apart in a document, drawn by `Callout`. */
export type CalloutBlock = {
  /** One of `CALLOUT_LEVELS`. */
  level: CalloutLevel;
  /** Shown in place of the level's own label ("Note"). */
  label?: string | null;
  /** The callout's text. */
  content: RichTextState;
};

/** Where a citation points: a source record as Payload populates it. */
export type CitationBlock = {
  /** The source: its name and edition, and where it is read. */
  source: {
    id: string;
    name: string;
    edition?: string | null;
    url?: string | null;
    /** The file attached to the source, read when there is no `url`. */
    file?: { url?: string | null } | null;
  };
  /** The place in the source, as it numbers itself: "3-7-2", "Chapter 4". */
  at: string;
};

/** A "show more" section, drawn by `Disclosure`. */
export type DisclosureBlock = {
  /** The line that is always shown: plain text. */
  summary: string;
  /** What it shows when open. */
  content: RichTextState;
};

/**
 * Each block the package draws, by slug: its fields as Payload sends them,
 * without `id`, `blockName` and `blockType`. An optional field may be
 * `null`; nested rich text is a `content: RichTextState` field.
 */
export interface BlockFieldTypes {
  // One line per block, alphabetical: `callout: CalloutBlock;`
  airport: AirportBlock;
  callout: CalloutBlock;
  citation: CitationBlock;
  disclosure: DisclosureBlock;
  flightCategory: FlightCategoryBlock;
  frequency: FrequencyBlock;
  position: PositionBlock;
  rating: RatingBlock;
  time: TimeBlock;
}

/** A slug the package draws. */
export type BlockSlug = keyof BlockFieldTypes;

/**
 * Each slug the package draws, block or inline: Payload's `BlocksFeature`
 * lists the first under `blocks` and the second under `inlineBlocks`.
 */
export const BLOCKS = {
  // One line per block, alphabetical: `callout: "block",`
  airport: "inline",
  callout: "block",
  citation: "inline",
  disclosure: "block",
  flightCategory: "inline",
  frequency: "inline",
  position: "inline",
  rating: "inline",
  time: "inline",
} as const satisfies { [Slug in BlockSlug]: BlockKind };

// The option lists Payload's selects need, each beside its block's type.

/** A callout's levels: the FAA's NOTE, CAUTION, WARNING and REFERENCE. */
export const CALLOUT_LEVELS = [
  "info",
  "caution",
  "danger",
  "reference",
] as const;

/** How a callout reads: `info`, `caution`, `danger`, or `reference` (no colour). */
export type CalloutLevel = (typeof CALLOUT_LEVELS)[number];

// Inline blocks. Fields are the component's props; a text field holds what a
// number prop would (a frequency in megahertz), and an optional one may be
// `null`.

/** `airport`: `Airport`. */
export type AirportBlock = {
  airport: { code: string; name?: string | null };
  nameAt?: (typeof AIRPORT_NAME_AT)[number] | null;
  focusable?: boolean | null;
};
/** Where `airport`'s name goes: after the code, or in a tooltip. */
export const AIRPORT_NAME_AT = ["inline", "tooltip"] as const;

/** `flightCategory`: `FlightCategory`. */
export type FlightCategoryBlock = {
  category: FlightCategoryCode;
  focusable?: boolean | null;
};
export { FLIGHT_CATEGORIES, type FlightCategoryCode };

/** `frequency`: `Frequency`. `value` is megahertz as text, and wins over `callsign`. */
export type FrequencyBlock = {
  value?: string | null;
  callsign?: string | null;
};

/**
 * `position`: `Position`, always inline. A position with no airport may
 * arrive as `airport: {}`, or with a null `code`: both mean no airport.
 */
export type PositionBlock = {
  callsign: string;
  show?: PositionField[] | null;
  airportAt?: (typeof POSITION_AIRPORT_AT)[number] | null;
  airport?: { code?: string | null; name?: string | null } | null;
};
/** Where `position`'s airport goes. (`Position` also has `"left"`, for lists.) */
export const POSITION_AIRPORT_AT = ["right", "under"] as const;
export { POSITION_FIELDS, type PositionField };

/** `rating`: `Rating`. `rating` is the short code (`"C1"`, `"IR"`). */
export type RatingBlock = {
  rating: string;
  kind?: (typeof RATING_KINDS)[number] | null;
  focusable?: boolean | null;
};
/** Whose rating it is. */
export const RATING_KINDS = ["controller", "pilot"] as const;
/** The controller ratings' short codes, in VATSIM's order. */
export const CONTROLLER_RATING_CODES = RATINGS.map((r) => r.short);
/** The pilot ratings' short codes, in VATSIM's order. */
export const PILOT_RATING_CODES = PILOT_RATINGS.map((r) => r.short);

/**
 * `time`: `Time`'s daily Zulu form. `value` and `end` are four digits,
 * `"2300"`; an `end` before `value` is after midnight.
 */
export type TimeBlock = {
  value: string;
  end?: string | null;
};
