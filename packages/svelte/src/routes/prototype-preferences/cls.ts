// PROTOTYPE: the chrome prototype's class recipes, on the roles.
export const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** A row in the user menu. */
export const row = `flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-foreground-soft transition-colors hover:bg-muted hover:text-foreground ${focus}`;

export const groupLabel =
  "px-3 pt-3 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase";

/** A segmented control's button; `on` when pressed. */
export const seg = (on: boolean) =>
  `inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-md px-2 text-xs ${focus} ${
    on
      ? "bg-muted text-foreground font-semibold"
      : "text-muted-foreground hover:text-foreground"
  }`;

export const segGroup = "flex rounded-lg bg-background p-0.5";

export const note = "text-xs text-muted-foreground";

export const button = `inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground ${focus}`;

export const linkButton = `inline-flex min-h-11 cursor-pointer items-center rounded-sm text-link underline underline-offset-4 hover:decoration-2 ${focus}`;
