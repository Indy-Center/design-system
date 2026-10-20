// The form controls' shared looks. ErrorIcon, beside this file, is Field's
// and Fieldset's error icon.

// The look Input, Textarea and Select share: the input roles, the ring
// outline, a destructive border when invalid, and 44px targets.
export const formControlClasses = [
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
