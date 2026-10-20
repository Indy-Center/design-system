<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";
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
    /** The button's text. */
    children: Snippet;
  };

  type AsButton = Own &
    HTMLButtonAttributes & {
      /** Leave out for a button; give it to make a link that looks like one. */
      href?: undefined;
      /** Makes it a toggle: on (true) or off (false). The app flips it in onclick. */
      pressed?: boolean;
    };

  type AsLink = Own &
    HTMLAnchorAttributes & {
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

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
    secondary: "border border-input text-foreground hover:bg-muted",
    danger: "bg-destructive text-card hover:bg-destructive/90",
  };

  const sizes = {
    sm: "min-h-11 px-3 py-1.5 text-sm",
    md: "min-h-11 px-4 py-2 text-base",
    lg: "min-h-12 px-6 py-3 text-lg",
  };

  const classes = $derived([
    "inline-flex min-w-11 cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    busy && "cursor-wait",
    className,
  ]);

  // Busy stays focusable (not `disabled`), so focus isn't lost; it just
  // drops the press. preventDefault also stops a submit or a link.
  function handleClick(event: MouseEvent & { currentTarget: HTMLElement }) {
    if (busy) {
      event.preventDefault();
      return;
    }
    (onclick as ((e: typeof event) => void) | null | undefined)?.(event);
  }
</script>

{#snippet content()}
  {#if pressed !== undefined}
    <!-- Filled when on, hollow when off: the state by shape, not colour. -->
    <span
      data-pressed-mark
      aria-hidden="true"
      class={[
        "size-3 shrink-0 rounded-full border-2 border-current",
        pressed && "bg-current",
      ]}
    ></span>
  {/if}
  {#if busy}
    <!-- Only drawn: the status beside the button does the telling. -->
    <span aria-hidden="true" class="inline-flex">
      <Spinner label={busyLabel} />
    </span>
  {/if}
  {@render children()}
{/snippet}

{#if busy !== undefined}
  <!-- Beside the button, not in it: readers hold back updates inside an
       aria-busy element, and a button's children are presentational. It is
       on the page before busy starts, so the change is announced. Before
       the button, so `space-x-*` on a parent still spaces the button. -->
  <span role="status" class="sr-only">{busy ? busyLabel : ""}</span>
{/if}

{#if href !== undefined}
  <a
    {href}
    {...rest as HTMLAnchorAttributes}
    aria-busy={busy || undefined}
    onclick={handleClick}
    class={classes}>{@render content()}</a
  >
{:else}
  <button
    type="button"
    {...rest as HTMLButtonAttributes}
    aria-pressed={pressed}
    aria-busy={busy || undefined}
    onclick={handleClick}
    class={classes}>{@render content()}</button
  >
{/if}
