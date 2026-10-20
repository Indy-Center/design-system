// Throwaway: the severity scale for the prototype page. Class strings are
// written out in full so Tailwind finds them.
import {
  mdiAlert,
  mdiAlertCircle,
  mdiAlertOctagon,
  mdiAlertOctagonOutline,
  mdiAlertOutline,
  mdiBookOpenVariant,
  mdiBookOpenVariantOutline,
  mdiCheckCircle,
  mdiCheckCircleOutline,
  mdiCloseCircle,
  mdiInformation,
  mdiInformationOutline,
} from "@mdi/js";

export type Level = "info" | "success" | "caution" | "danger";
export type CalloutLevel = Level | "reference";
export const levels: Level[] = ["info", "success", "caution", "danger"];
export const calloutLevels: CalloutLevel[] = [
  "info",
  "success",
  "caution",
  "danger",
  "reference",
];

// The spoken label, read before the message ("Caution: …").
export const spoken: Record<CalloutLevel, string> = {
  info: "Info",
  success: "Success",
  caution: "Caution",
  danger: "Danger",
  reference: "Reference",
};

// The FAA's words, for the documents feature's Callout.
export const faa: Record<CalloutLevel, string> = {
  info: "Note",
  success: "Success",
  caution: "Caution",
  danger: "Warning",
  reference: "Reference",
};

export const roleOf: Record<CalloutLevel, string> = {
  info: "info",
  success: "success",
  caution: "warning",
  danger: "destructive",
  reference: "muted-foreground",
};

export type IconSet = "A" | "B" | "C";
export const iconSets: Record<
  IconSet,
  { name: string; icons: Record<CalloutLevel, string> }
> = {
  A: {
    name: "Filled, a different shape each",
    icons: {
      info: mdiInformation,
      success: mdiCheckCircle,
      caution: mdiAlert,
      danger: mdiAlertOctagon,
      reference: mdiBookOpenVariant,
    },
  },
  B: {
    name: "Outline, a different shape each",
    icons: {
      info: mdiInformationOutline,
      success: mdiCheckCircleOutline,
      caution: mdiAlertOutline,
      danger: mdiAlertOctagonOutline,
      reference: mdiBookOpenVariantOutline,
    },
  },
  C: {
    name: "Filled circles, only the glyph differs",
    icons: {
      info: mdiInformation,
      success: mdiCheckCircle,
      caution: mdiAlertCircle,
      danger: mdiCloseCircle,
      reference: mdiBookOpenVariant,
    },
  },
};

export const icon = (level: CalloutLevel, set: IconSet = "A") =>
  iconSets[set].icons[level];

// Text in the role's colour.
export const text: Record<CalloutLevel, string> = {
  info: "text-info",
  success: "text-success",
  caution: "text-warning",
  danger: "text-destructive",
  reference: "text-muted-foreground",
};

export type AlertStyle = "tinted" | "bordered" | "filled";

// The box, per style and level.
export const box: Record<AlertStyle, Record<Level, string>> = {
  tinted: {
    info: "border border-info/40 bg-info/10",
    success: "border border-success/40 bg-success/10",
    caution: "border border-warning/40 bg-warning/10",
    danger: "border border-destructive/40 bg-destructive/10",
  },
  bordered: {
    info: "border border-border border-l-4 border-l-info bg-card",
    success: "border border-border border-l-4 border-l-success bg-card",
    caution: "border border-border border-l-4 border-l-warning bg-card",
    danger: "border border-border border-l-4 border-l-destructive bg-card",
  },
  // Text on the fill is the card colour: white in light, slate in dark.
  filled: {
    info: "bg-info text-card",
    success: "bg-success text-card",
    caution: "bg-warning text-card",
    danger: "bg-destructive text-card",
  },
};
