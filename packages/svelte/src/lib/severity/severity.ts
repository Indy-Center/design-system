// The severity scale shared by Alert and Toast. Class strings are written
// out in full so Tailwind finds them.

/** How serious a message is, least to most important. */
export type Severity = "info" | "success" | "caution" | "danger";

export type SeverityLevel = {
  /** Read before the message, with a colon: "Caution: …". */
  label: string;
  /** The colour role it is drawn in. */
  role: "info" | "success" | "warning" | "destructive";
  /** An MDI outline path, a different shape for each level. */
  icon: string;
  /** Text and icons in the role's colour. Keep `text-warning` off `bg-background`. */
  text: string;
  /** Alert's tint: a wash and a faint border in the role's colour. */
  tint: string;
  /** Toast's rule down its leading edge, in the role's colour. */
  rule: string;
};

/** Each level's spoken label, role and icon, least to most important. */
export const SEVERITIES: Record<Severity, SeverityLevel> = {
  info: {
    label: "Info",
    role: "info",
    // mdiInformationOutline
    icon: "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",
    text: "text-info",
    tint: "border-info/40 bg-info/10",
    rule: "border-l-info",
  },
  success: {
    label: "Success",
    role: "success",
    // mdiCheckCircleOutline
    icon: "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z",
    text: "text-success",
    tint: "border-success/40 bg-success/10",
    rule: "border-l-success",
  },
  caution: {
    label: "Caution",
    role: "warning",
    // mdiAlertOutline
    icon: "M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16",
    text: "text-warning",
    tint: "border-warning/40 bg-warning/10",
    rule: "border-l-warning",
  },
  danger: {
    label: "Danger",
    role: "destructive",
    // mdiAlertOctagonOutline
    icon: "M8.27,3L3,8.27V15.73L8.27,21H15.73C17.5,19.24 21,15.73 21,15.73V8.27L15.73,3M9.1,5H14.9L19,9.1V14.9L14.9,19H9.1L5,14.9V9.1M11,15H13V17H11V15M11,7H13V13H11V7",
    text: "text-destructive",
    tint: "border-destructive/40 bg-destructive/10",
    rule: "border-l-destructive",
  },
};

/** MDI's close, for the dismiss buttons. */
export const closeIcon =
  "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
