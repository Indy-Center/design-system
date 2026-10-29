<script lang="ts">
  import { Disclosure } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <Disclosure>
    {#snippet summary()}Why do I need a rating?{/snippet}
    <p>Each position needs its own rating before you can work it.</p>
  </Disclosure>

  <div class="mt-4 divide-y divide-border border-y border-border">
    <Disclosure name="faq" open>
      {#snippet summary()}How do I join?{/snippet}
      <p>Ask for a transfer or a visit from your VATSIM dashboard.</p>
    </Disclosure>
    <Disclosure name="faq">
      {#snippet summary()}How long does training take?{/snippet}
      <p>Most students reach S1 in a few weeks.</p>
    </Disclosure>
  </div>
</Schemes>
