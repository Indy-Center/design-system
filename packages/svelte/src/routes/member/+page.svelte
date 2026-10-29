<script lang="ts">
  import { Member } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <ul class="space-y-2 pb-8 text-foreground">
    <li><Member name="Jordan Sample" cid={1000001} /></li>
    <li>
      <Member name="Alex Example" cid={1000002} href="#member" />
    </li>
    <li>
      <!-- Name-private: the first name alone. -->
      <Member name="Sam" cid={1000003} showCid={false} />
    </li>
    <li class="rounded-md bg-card p-3 text-sm">
      Feedback for <Member name="Jordan Sample" cid={1000001} href="#member" />
      on IND_83_CTR.
    </li>
  </ul>
</Schemes>
