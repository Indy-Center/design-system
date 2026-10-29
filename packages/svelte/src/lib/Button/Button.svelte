<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
    MouseEventHandler,
  } from "svelte/elements";
  import { buttonClasses } from "../buttonClasses/buttonClasses.js";
  import Spinner from "../Spinner/Spinner.svelte";

  type Own = {
    /** `primary` for the main action, `secondary` for the rest, `danger` for one that deletes. */
    variant?: "primary" | "secondary" | "danger";
    /** `md` by default; `md` lines up with Input. Every size is at least 44px. */
    size?: "sm" | "md" | "lg";
    /** While true: shows a Spinner, sets `aria-busy` and ignores presses. Pass it from the start (false) so the change is announced. */
    busy?: boolean;
    /** What screen readers are told while busy. "Working" by default. */
    busyLabel?: string;
    /** Runs on a press, unless busy. */
    onclick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    /** The button's text. */
    children: Snippet;
  };

  type AsButton = Own &
    Omit<HTMLButtonAttributes, "onclick"> & {
      /** Leave out for a button; give it to make a link that looks like one. */
      href?: undefined;
      /** Makes it a toggle: on (true) or off (false). The app flips it in onclick. */
      pressed?: boolean;
    };

  type AsLink = Own &
    Omit<HTMLAnchorAttributes, "onclick"> & {
      /** Where the link goes. */
      href: string;
      /** Links can't be toggles. */
      pressed?: undefined;
      /** Links can't be disabled; leave out `href` for a button that can. */
      disabled?: undefined;
    };

  type Props = AsButton | AsLink;

  let {
    variant = "primary",
    size = "md",
    busy,
    busyLabel = "Working",
    pressed,
    href,
    onclick,
    children,
    class: className,
    ...rest
  }: Props = $props();

  const sizes = {
    sm: "min-h-11 px-3 py-1.5 text-sm",
    md: "min-h-11 px-4 py-2 text-base",
    lg: "min-h-12 px-6 py-3 text-lg",
  };

  // A toggle only on a button: links can't be pressed.
  const toggle = $derived(href === undefined && pressed !== undefined);

  const classes = $derived([
    "inline-flex min-w-11 cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-60",
    buttonClasses[variant],
    sizes[size],
    // The toggle's mark, before the text: filled when on, hollow when off,
    // so the state is shown by shape, not colour.
    toggle &&
      "before:size-3 before:shrink-0 before:rounded-full before:border-2 before:border-current aria-pressed:before:bg-current",
    busy && "cursor-wait",
    className,
  ]);

  // Busy stays focusable (not `disabled`), so focus isn't lost; it just
  // drops the press. preventDefault also stops a submit or a link.
  function handleClick(
    event: MouseEvent & {
      currentTarget: EventTarget & (HTMLButtonElement | HTMLAnchorElement);
    },
  ) {
    if (busy) {
      event.preventDefault();
      return;
    }
    onclick?.(event);
  }

  // A middle-click opens a link in a new tab; drop that while busy too.
  function handleAuxClick(event: MouseEvent) {
    if (busy && href !== undefined) event.preventDefault();
  }
</script>

{#if busy !== undefined}
  <!-- Beside the button, not in it: readers hold back updates inside an
       aria-busy element, and a button's children are presentational. It is
       on the page before busy starts, so the change is announced. Before
       the button, so `space-x-*` on a parent still spaces the button. -->
  <span role="status" class="sr-only">{busy ? busyLabel : ""}</span>
{/if}

<svelte:element
  this={href === undefined ? "button" : "a"}
  type={href === undefined ? "button" : undefined}
  {href}
  {...rest}
  aria-pressed={toggle ? pressed : undefined}
  aria-busy={busy || undefined}
  onclick={handleClick}
  onauxclick={handleAuxClick}
  class={classes}
>
  {#if busy}
    <!-- Only drawn: the status beside the button does the telling. -->
    <span aria-hidden="true" class="inline-flex"><Spinner /></span>
  {/if}
  {@render children()}
</svelte:element>
