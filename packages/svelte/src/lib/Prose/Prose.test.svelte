<script lang="ts">
  // Prose holding lesson-plan HTML, as an app shows a CMS body, or other
  // HTML a test gives. A component, not createRawSnippet, which would need
  // one root element around the HTML and so change what prose styles (see
  // CONVENTIONS.md, Tests).
  import type { ComponentProps } from "svelte";
  import Prose from "./Prose.svelte";
  import { lessonHtml } from "../../playground/lesson.ts";

  let {
    html = lessonHtml,
    ...props
  }: Omit<ComponentProps<typeof Prose>, "children"> & { html?: string } =
    $props();
</script>

<Prose {...props}>{@html html}</Prose>
