<script lang="ts">
  import { Card, Heading, Text } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <ul class="grid gap-3">
    <Card as="li">
      <Heading level={3}>Friday Night Ops</Heading>
      <Text size="small" class="mt-1">Fri 24 Oct · 2300–0200Z</Text>
      <p class="mt-3">
        Full staffing across Indy Center and its approaches. Sign up for a
        position by Wednesday.
      </p>
    </Card>
    <Card as="li" flush>
      <p class="border-b border-border px-4 py-3">Flush: a row to the edge</p>
      <p class="px-4 py-3">And another</p>
    </Card>
  </ul>
</Schemes>
