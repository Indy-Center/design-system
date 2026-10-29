<script lang="ts">
  // Shows one specimen three times: on a light page, on a dark page, and in
  // the dark header on a light page (the guide's framed light).
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  const label =
    "mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase";
</script>

<div class="grid gap-4 lg:grid-cols-3">
  <section class="rounded-lg border border-border bg-background p-4">
    <h2 class={label}>Light</h2>
    <div class="text-foreground-soft">{@render children()}</div>
  </section>

  <section
    data-theme="dark"
    class="rounded-lg border border-border bg-background p-4"
  >
    <h2 class={label}>Dark</h2>
    <div class="text-foreground-soft">{@render children()}</div>
  </section>

  <section class="rounded-lg border border-border bg-background p-4">
    <h2 class={label}>Dark header on a light page</h2>
    <header data-theme="dark" class="rounded-md bg-background p-4">
      <div class="text-foreground-soft">{@render children()}</div>
    </header>
  </section>
</div>
