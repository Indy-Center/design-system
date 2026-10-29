<script lang="ts">
  import { Credential } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>Credential · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Credential
</h1>

<Schemes>
  <div class="space-y-4 pb-8">
    <ul class="flex flex-wrap items-center gap-2">
      <li>
        <Credential
          code="S-GC"
          name="Simple Ground Control"
          kind="certification"
        />
      </li>
      <li>
        <Credential
          code="A-LC"
          name="Advanced Local Control"
          kind="certification"
        />
      </li>
      <li>
        <Credential
          code="S-LC"
          name="Simple Local Control"
          kind="endorsement"
        />
      </li>
      <li>
        <Credential
          code="APP-SOLO"
          name="Approach solo"
          kind="solo"
          until="2026-11-03"
        />
      </li>
      <li><Credential code="IND_APP" kind="certification" /></li>
    </ul>
    <p class="flex flex-wrap items-center gap-2 rounded-md bg-card p-3 text-sm">
      Jordan Sample
      <Credential
        code="S-GC"
        name="Simple Ground Control"
        kind="certification"
        focusable
      />
      <Credential
        code="TWR-SOLO"
        name="Tower solo"
        kind="solo"
        until="2026-11-17"
        focusable
      />
    </p>
  </div>
</Schemes>
