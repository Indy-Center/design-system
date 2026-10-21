<script lang="ts">
  import { mdiChevronDown } from "@mdi/js";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { buttonClasses } from "../buttonClasses/buttonClasses.js";
  import { dismiss } from "../dismiss/dismiss.js";
  import Icon from "../Icon/Icon.svelte";

  type Props = Omit<
    HTMLButtonAttributes,
    // What the arrow sets itself: `children` (the rows are the menu's,
    // drawn in the panel), `type` (always "button"), `popovertarget` and
    // `popovertargetaction` (the menu shows its panel itself), and the
    // `onclick` and `onfocusout` handlers that open and close it.
    | "children"
    | "type"
    | "popovertarget"
    | "popovertargetaction"
    | "onclick"
    | "onfocusout"
  > & {
    /** What the arrow opens, for screen readers: "More actions for Jo Rivera". */
    label: string;
    /** Words beside the arrow. Leave out for an arrow alone. */
    text?: string;
    /** The arrow half of a split button, flush against the button before it. */
    attached?: boolean;
    /** Matches the Button it is attached to. `secondary` by default. */
    variant?: "primary" | "secondary";
    /** The menu's rows: `DropdownMenuItem`s. */
    children: Snippet;
  };

  let {
    label,
    text,
    attached = false,
    variant = "secondary",
    children,
    class: className,
    ...rest
  }: Props = $props();

  const id = $props.id();
  // Ties the panel to the trigger for CSS anchor positioning.
  const anchor = `--dropdown-${id}`;

  let open = $state(false);
  let trigger = $state<HTMLButtonElement>();
  let panel = $state<HTMLDivElement>();

  // The panel is a manual popover: the browser draws it above everything
  // (a table or a scrolling box can't clip it), and `dismiss` closes it.
  $effect(() => {
    if (!panel) return;
    if (open && !panel.matches(":popover-open")) panel.showPopover();
    if (!open && panel.matches(":popover-open")) panel.hidePopover();
  });

  function close() {
    open = false;
  }

  // Choosing a row closes the menu. Focus would be lost as the panel hides,
  // so it goes back to the arrow. A form in a row still sends: the panel
  // is only hidden, not taken off the page.
  function onpanelclick(event: MouseEvent) {
    const row = (event.target as Element).closest("a[href], button");
    if (!row || row.matches(":disabled")) return;
    close();
    trigger?.focus();
  }

  // Tabbing out of the menu closes it, so it doesn't cover what comes next.
  // Focus leaving the window (relatedTarget null) leaves it open.
  function onfocusout(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (!next || trigger?.contains(next) || panel?.contains(next)) return;
    close();
  }
</script>

<button
  {...rest}
  bind:this={trigger}
  type="button"
  aria-label={label}
  aria-expanded={open}
  aria-controls={id}
  onclick={() => (open = !open)}
  {onfocusout}
  style:anchor-name={anchor}
  class={[
    "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 text-base font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-60",
    // Button's looks, so the arrow matches the button it's attached to.
    buttonClasses[variant],
    attached
      ? [
          "self-stretch rounded-r-lg px-2",
          variant === "secondary"
            ? "border-l-0"
            : "border-l border-primary-hover",
        ]
      : ["rounded-lg py-2", text ? "px-4" : "px-2"],
    className,
  ]}
>
  {#if text}{text}{/if}
  <Icon
    path={mdiChevronDown}
    class={["size-5 transition-transform", open && "rotate-180"]}
  />
</button>

<!-- Always on the page, shown by the browser. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  {id}
  popover="manual"
  bind:this={panel}
  use:dismiss={{ open, trigger, onclose: close }}
  onclick={onpanelclick}
  {onfocusout}
  style:position-anchor={anchor}
  class="dropdown-panel m-0 mt-1 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-card p-1 text-foreground shadow-lg"
>
  {@render children()}
</div>

<style>
  /* Under the arrow, its right edge on the arrow's; flipped to stay in the
     window. Tailwind has no utilities for these yet. */
  .dropdown-panel {
    inset: auto;
    position-area: bottom span-left;
    position-try-fallbacks: flip-inline, flip-block;
  }
</style>
