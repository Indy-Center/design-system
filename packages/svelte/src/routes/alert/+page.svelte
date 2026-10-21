<script lang="ts">
  import { Alert, SEVERITIES, type Severity } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  const levels = Object.keys(SEVERITIES) as Severity[];
  const messages: Record<Severity, string> = {
    info: "The roster updates nightly.",
    success: "Your session request was sent.",
    caution: "Your training session starts in 10 minutes.",
    danger: "We couldn't save the roster. Try again.",
  };
</script>

<svelte:head><title>Alert · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Alert</h1>

<Schemes>
  <div class="space-y-3">
    {#each levels as level (level)}
      <Alert {level}>{messages[level]}</Alert>
    {/each}
    <Alert level="danger" title="Not saved" dismissible>
      {messages.danger}
    </Alert>
    <Alert level="info" dismissible>{messages.info}</Alert>
  </div>
</Schemes>
