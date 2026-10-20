<script lang="ts">
  // Prose holding lesson-plan HTML, as an app shows a CMS body. A
  // component, not createRawSnippet, which would need one root element
  // around the HTML and so change what prose styles.
  import type { ComponentProps } from "svelte";
  import Prose from "../src/lib/Prose/Prose.svelte";
  import { lessonHtml } from "./lesson.ts";

  let props: Omit<ComponentProps<typeof Prose>, "children"> = $props();
</script>

<Prose {...props}>{@html lessonHtml}</Prose>
