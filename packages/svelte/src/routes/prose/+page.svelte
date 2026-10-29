<script lang="ts">
  import { Prose } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import { lessonHtml } from "../../playground/lesson.ts";
</script>

<Schemes>
  <Prose>{@html lessonHtml}</Prose>
</Schemes>
