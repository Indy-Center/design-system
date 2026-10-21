<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Card from "../Card/Card.svelte";

  type Props = HTMLAttributes<HTMLDListElement> & {
    /** What is counted, such as "Total users": the list's term. */
    label: string;
    /** The count. A number is written with thousands separators. */
    value: string | number;
    /** The sub-line under the number, such as "287 controllers". */
    detail?: string;
    /** An icon for the tile on the right, such as `<Icon path={mdiAccount} />`. Decorative: hidden from screen readers. */
    icon?: Snippet;
  };

  let {
    label,
    value,
    detail,
    icon,
    class: className,
    ...rest
  }: Props = $props();

  let shown = $derived(
    typeof value === "number" ? value.toLocaleString("en-US") : value,
  );
</script>

<!-- The card is a box around the list: a tile in a dl would need a term. -->
<Card class={["flex items-center justify-between gap-3", className]}>
  <dl {...rest} class="min-w-0">
    <dt class="text-sm text-muted-foreground">{label}</dt>
    <dd class="mt-1 font-heading text-2xl font-semibold text-foreground">
      {shown}
    </dd>
    {#if detail}
      <dd class="mt-1 text-sm text-muted-foreground">{detail}</dd>
    {/if}
  </dl>
  {#if icon}
    <div
      aria-hidden="true"
      class="flex shrink-0 rounded-lg bg-primary/15 p-3 text-2xl text-link"
    >
      {@render icon()}
    </div>
  {/if}
</Card>
