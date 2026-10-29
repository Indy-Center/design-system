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
