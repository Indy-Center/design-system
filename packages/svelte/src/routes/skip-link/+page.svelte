<script lang="ts">
  import { SkipLink } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>SkipLink · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  SkipLink
</h1>

<p class="mb-4">
  Each box holds a hidden skip link before a row of links. Press Tab: each skip
  link shows at the top left in its box's scheme, and Enter moves focus to the
  content below.
</p>

<Schemes>
  <SkipLink href="#skip-link-content" />
  <nav class="flex flex-wrap gap-4">
    <a href="#events" class="text-link underline">Events</a>
    <a href="#roster" class="text-link underline">Roster</a>
  </nav>
</Schemes>

<section
  id="skip-link-content"
  class="mt-6 rounded-lg border border-border bg-card p-4"
>
  <h2 class="font-heading text-xl font-semibold text-foreground">
    The content
  </h2>
  <p>Focus lands here; the next Tab goes on from this box.</p>
  <a href="#after" class="text-link underline">A link after the content</a>
</section>
