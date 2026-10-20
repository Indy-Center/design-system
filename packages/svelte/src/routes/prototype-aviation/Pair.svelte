<script lang="ts">
  // A wider specimen (a table, a list) on a light page and a dark one.
  import type { Snippet } from "svelte";
  let { children }: { children: Snippet } = $props();
  const label =
    "mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase";
</script>

<div class="grid gap-4 xl:grid-cols-2">
  <section class="min-w-0 rounded-lg border border-border bg-background p-4">
    <h2 class={label}>Light</h2>
    <div class="text-foreground-soft">{@render children()}</div>
  </section>
  <section
    data-theme="dark"
    class="min-w-0 rounded-lg border border-border bg-background p-4"
  >
    <h2 class={label}>Dark</h2>
    <div class="text-foreground-soft">{@render children()}</div>
  </section>
</div>
