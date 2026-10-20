// The look Input, Textarea and Select share: the input roles, the ring
// outline, a destructive border when invalid, and 44px targets.
export const formControlClasses = [
  "min-h-11 w-full rounded-lg border border-input bg-muted px-3 py-2 text-base text-foreground",
  "placeholder:text-placeholder",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "aria-invalid:border-destructive",
  "disabled:cursor-not-allowed disabled:opacity-60",
];
