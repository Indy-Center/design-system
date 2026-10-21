<!-- One row of a preference control (the time zone's, the colour scheme's):
     a button pressed while its choice is the one in use, with a tick. -->
<script lang="ts">
  import { mdiCheck } from "@mdi/js";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";

  type Props = Omit<HTMLButtonAttributes, "children"> & {
    /** Whether this choice is the one in use. */
    pressed: boolean;
    /** The row's icon, an MDI path. */
    icon: string;
    /** The choice's name. */
    children: Snippet;
    /** A line beneath the name, which describes the button. */
    detail?: Snippet;
    /** For a parent to focus or measure the button. */
    element?: HTMLButtonElement;
  };

  let {
    pressed,
    icon,
    children,
    detail,
    element = $bindable(),
    ...rest
  }: Props = $props();
  const id = $props.id();
</script>

<!-- Named by the choice alone; the line beneath describes it. -->
<button
  bind:this={element}
  type="button"
  {...rest}
  aria-pressed={pressed}
  aria-labelledby="{id}-name"
  aria-describedby={detail ? `${id}-detail` : undefined}
  class={[
    "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-1 text-left text-sm",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    pressed
      ? "bg-muted font-semibold text-foreground"
      : "text-foreground-soft hover:bg-muted hover:text-foreground",
  ]}
>
  <Icon path={icon} size={20} />
  <span class="flex-1">
    <span id="{id}-name">{@render children()}</span>
    {#if detail}
      <span
        id="{id}-detail"
        class="block text-xs font-normal text-muted-foreground"
        >{@render detail()}</span
      >
    {/if}
  </span>
  {#if pressed}<Icon path={mdiCheck} size={20} />{/if}
</button>
