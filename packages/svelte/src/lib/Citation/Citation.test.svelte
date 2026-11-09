<script lang="ts">
  import Citation, { type CitationSource } from "./Citation.svelte";

  let { source, at }: { source: CitationSource; at?: string } = $props();
</script>

<p>Hold departures behind a heavy, per <Citation {source} {at} />.</p>
