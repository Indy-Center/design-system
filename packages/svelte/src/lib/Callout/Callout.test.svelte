<!-- A callout in a document, holding paragraphs as RichText draws them. -->
<script lang="ts">
  import Prose from "../Prose/Prose.svelte";
  import Callout from "./Callout.svelte";
</script>

<Prose>
  <p>Before.</p>
  <Callout level="info">
    <p>First paragraph.</p>
    <p>Second paragraph.</p>
  </Callout>
  <p>After.</p>
</Prose>
