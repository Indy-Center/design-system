<script lang="ts">
  // One labelled option in a decision: letter, one-line description, specimen.
  import type { Snippet } from "svelte";

  let {
    letter,
    note,
    pick = false,
    today = false,
    children,
  }: {
    letter: string;
    note: string;
    pick?: boolean;
    today?: boolean;
    children: Snippet;
  } = $props();
</script>

<div
  class={[
    "rounded-md border p-3",
    pick ? "border-primary border-2" : "border-border",
  ]}
>
  <p class="mb-2 text-xs text-muted-foreground">
    <span class="font-mono font-semibold text-foreground">{letter}</span>
    {#if pick}<span
        class="ml-1 rounded-sm bg-primary px-1.5 py-0.5 font-semibold text-primary-foreground"
        >Recommended</span
      >{/if}
    {#if today}<span
        class="ml-1 rounded-sm border border-border px-1.5 py-0.5 font-semibold"
        >Today's look</span
      >{/if}
    <span class="ml-1">{note}</span>
  </p>
  <div class="space-y-2">{@render children()}</div>
</div>
