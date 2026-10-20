<script lang="ts">
  import { Heading } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>Heading · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Heading
</h1>

<p class="mb-4">
  Every specimen is an <code>h3</code>, so the page's outline stays in order;
  only <code>look</code> changes.
</p>

<Schemes>
  <div class="space-y-3">
    <Heading level={3} look={1}>Look 1: Upcoming events</Heading>
    <Heading level={3} look={2}>Look 2: Upcoming events</Heading>
    <Heading level={3}>Look 3: Upcoming events</Heading>
    <Heading level={3} look={4}>Look 4: Upcoming events</Heading>
    <Heading level={3} look="label">Label: Upcoming events</Heading>
    <p>Body text after the headings, for scale.</p>
  </div>
</Schemes>
