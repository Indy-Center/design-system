<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = Omit<HTMLButtonAttributes, "type" | "aria-pressed"> & {
    /** Whether the filter is on, bindable. It flips itself when pressed. */
    pressed?: boolean;
    /** How many rows the filter covers, shown after the text. */
    count?: number;
    /** What the filter shows or hides, such as a status. */
    children: Snippet;
  };

  let {
    pressed = $bindable(false),
    count,
    children,
    onclick,
    class: className,
    ...rest
  }: Props = $props();
</script>

<!-- Off is struck through as well as dimmed, so the state isn't told by
     colour alone, and what is hidden still reads as a choice. -->
<button
  type="button"
  {...rest}
  aria-pressed={pressed}
  onclick={(event) => {
    pressed = !pressed;
    onclick?.(event);
  }}
  class={[
    "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
    "border-input text-muted-foreground line-through not-aria-pressed:hover:bg-muted",
    "aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-foreground aria-pressed:no-underline",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-60",
    className,
  ]}
>
  {@render children()}{#if count !== undefined}&nbsp;({count}){/if}
</button>
