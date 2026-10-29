<script lang="ts">
  import { Link } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>Link · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Link</h1>

<Schemes>
  <p>
    See the <Link href="/events">event schedule</Link> for this week's events, or
    ask in <Link href="https://discord.indy.center">Discord</Link>.
  </p>
</Schemes>
