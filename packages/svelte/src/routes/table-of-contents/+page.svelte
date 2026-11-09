<script lang="ts">
  import {
    TableOfContents,
    type RichTextState,
    type SerializedNode,
  } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import { lessonPlanBody } from "../../playground/richText.ts";

  const heading = (tag: string, words: string): SerializedNode => ({
    type: "heading",
    tag,
    children: [{ type: "text", text: words, format: 0 }],
  });

  // Made-up headings: an h3 before any h2, an h4 left out, and a repeat.
  const outline: RichTextState = {
    root: {
      type: "root",
      children: [
        heading("h3", "Before you start"),
        heading("h2", "Taxi"),
        heading("h3", "Ground"),
        heading("h4", "Too deep to list"),
        heading("h3", "Ramp"),
        heading("h2", "Departure"),
        heading("h2", "Taxi"),
      ],
    },
  };
</script>

<Schemes>
  <TableOfContents content={lessonPlanBody} />
</Schemes>

<h2 class="mt-8 mb-4 font-heading text-xl font-semibold text-foreground">
  Level and order
</h2>
<Schemes>
  <TableOfContents content={outline} />
</Schemes>

<h2 class="mt-8 mb-4 font-heading text-xl font-semibold text-foreground">
  A renamed landmark
</h2>
<Schemes>
  <TableOfContents content={outline} label="On this page" />
</Schemes>
