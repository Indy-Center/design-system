<!-- Disclosure with `bind:open`, its state in a status, and a button that
     opens it from outside. -->
<script lang="ts">
  import Disclosure from "./Disclosure.svelte";

  let open = $state(false);
</script>

<Disclosure bind:open>
  {#snippet summary()}Why do I need a rating?{/snippet}
  Each position needs its own rating.
</Disclosure>
<p role="status">{open ? "open" : "closed"}</p>
<button type="button" onclick={() => (open = true)}>Open it</button>
