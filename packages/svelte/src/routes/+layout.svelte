<script lang="ts">
  import "../playground/playground.css";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen bg-background font-sans text-foreground-soft">
  <header
    data-theme="dark"
    class="border-b border-border bg-background px-4 py-3"
  >
    <a
      href="/"
      class="font-heading text-lg font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >Centerline playground</a
    >
  </header>
  <main class="mx-auto max-w-6xl px-4 py-6">
    {@render children()}
  </main>
</div>
