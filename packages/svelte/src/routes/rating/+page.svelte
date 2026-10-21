<script lang="ts">
  import { Chip, Rating } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>Rating · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Rating</h1>

<Schemes>
  <div class="space-y-4 pb-8">
    <ul class="flex flex-wrap items-center gap-2">
      <li><Rating rating={3} /></li>
      <li><Rating rating="C1" /></li>
      <li><Rating rating="Instructor1" /></li>
      <li><Rating rating={3} kind="pilot" /></li>
      <li><Rating rating="ATPL" kind="pilot" /></li>
    </ul>
    <p class="flex flex-wrap items-center gap-2 rounded-md bg-card p-3 text-sm">
      Jordan Sample <Chip variant="initials">JS</Chip>
      <Rating rating="S3" />
      <Rating rating="PPL" kind="pilot" />
    </p>
  </div>
</Schemes>
