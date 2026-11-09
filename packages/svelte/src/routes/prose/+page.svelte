<script lang="ts">
  import { Prose } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import { lessonHtml } from "../../playground/lesson.ts";
  import { richHtml } from "../../playground/proseMarkup.ts";
</script>

<Schemes>
  <Prose>{@html lessonHtml}</Prose>
</Schemes>

<!-- What RichText writes beyond the lesson: underline and strike,
     alignment, a checklist, tables, links that open in a new tab. -->
<div class="mt-8">
  <Schemes>
    <Prose as="div">{@html richHtml}</Prose>
  </Schemes>
</div>
