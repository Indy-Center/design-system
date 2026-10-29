<script lang="ts">
  import { Text } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <div class="space-y-3">
    <Text lead>
      Lead: events, sessions and staffing for the Indianapolis ARTCC.
    </Text>
    <p>Body text: a plain paragraph, with no component.</p>
    <Text>Text with no look: the same as the paragraph above.</Text>
    <Text tone="muted">Muted: last updated 20 October 2026.</Text>
    <Text size="small">Small: times are in your own time zone.</Text>
    <p>
      Inline, as a span:
      <Text as="span" tone="muted">(optional)</Text>
    </p>
  </div>
</Schemes>
