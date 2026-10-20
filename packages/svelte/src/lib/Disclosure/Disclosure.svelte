<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLDetailsAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";

  // MDI's chevron-right.
  const chevron = "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z";

  type Props = HTMLDetailsAttributes & {
    /** The line that is always shown, and opens and closes the rest. */
    summary: Snippet;
    /** What it shows when open. */
    children: Snippet;
    /** Whether it is open. Closed by default; bindable. */
    open?: boolean;
  };

  let {
    summary,
    children,
    open = $bindable(false),
    class: className,
    ...rest
  }: Props = $props();
</script>

<details {...rest} bind:open class={["group", className]}>
  <summary
    class={[
      "flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md py-2",
      "font-medium text-foreground [&::-webkit-details-marker]:hidden",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    ]}
  >
    <Icon
      path={chevron}
      size={20}
      class="text-muted-foreground motion-safe:transition-transform group-open:rotate-90"
    />
    <span class="flex-1">{@render summary()}</span>
  </summary>
  <div class="pb-2 pl-7 text-foreground-soft">{@render children()}</div>
</details>
