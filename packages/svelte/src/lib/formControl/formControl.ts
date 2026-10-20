// The form controls' shared looks and wiring. Beside this file: Description,
// the hint and error under a control or group, and ErrorIcon, its icon.

/** The hint and error that Field, Fieldset and Checkbox show under themselves. */
export type DescriptionProps = {
  /** A line on what to enter or choose, shown under it. */
  hint?: string;
  /** What's wrong; marks it invalid when set. */
  error?: string;
};

/** The ids Description gives its hint and error, from one base id. */
export function descriptionIds(id: string) {
  return { hint: `${id}-hint`, error: `${id}-error` };
}

/**
 * The `aria-describedby` that points at the hint and error that are shown,
 * after any ids the caller passed; `undefined` when there are none.
 */
export function describedBy(
  id: string,
  { hint, error }: DescriptionProps,
  callers?: string | null,
) {
  const ids = descriptionIds(id);
  return (
    [callers, hint && ids.hint, error && ids.error].filter(Boolean).join(" ") ||
    undefined
  );
}

// The look Input, Textarea and Select share: the input roles, the ring
// outline, a destructive border when invalid, and 44px targets.
export const textControlClasses = [
  "min-h-11 w-full rounded-lg border border-input bg-muted px-3 py-2 text-base text-foreground",
  "placeholder:text-placeholder",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "aria-invalid:border-destructive",
  "disabled:cursor-not-allowed disabled:opacity-60",
];

// The look Checkbox and Radio share: the native box in the primary role, a
// ring outline, and a label row that's 44px tall and dims when disabled.
export const choiceRowClasses =
  "flex min-h-11 items-center gap-3 text-base text-foreground-soft has-disabled:cursor-not-allowed has-disabled:opacity-60";
export const choiceInputClasses =
  "size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed";
