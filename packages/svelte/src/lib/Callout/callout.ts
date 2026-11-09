// Callout's levels: the severity scale's info, caution and danger with the
// FAA's words, and reference, which has no colour. Class strings are
// written out in full so Tailwind finds them.
import { mdiBookOpenVariantOutline } from "@mdi/js";
import type { CalloutLevel } from "../blocks.js";
import { SEVERITIES } from "../severity/severity.js";

export type CalloutDetails = {
  /** The visible label that names it, unless the author gives one. */
  label: string;
  /** An MDI outline path, a different shape for each level. */
  icon: string;
  /** The icon's colour. */
  text: string;
  /** The wash and the border. */
  tint: string;
};

/** Each level's label, icon and colours. */
export const CALLOUTS: Record<CalloutLevel, CalloutDetails> = {
  info: { ...pick("info"), label: "Note" },
  caution: { ...pick("caution"), label: "Caution" },
  danger: { ...pick("danger"), label: "Warning" },
  reference: {
    label: "Reference",
    icon: mdiBookOpenVariantOutline,
    text: "text-muted-foreground",
    tint: "border-border bg-muted/60",
  },
};

/** A severity's icon and colours. */
function pick(level: "info" | "caution" | "danger") {
  const { icon, text, tint } = SEVERITIES[level];
  return { icon, text, tint };
}
