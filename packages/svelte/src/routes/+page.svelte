<script lang="ts">
  // The home page: src/playground/home.md, which llms-full.txt opens with.
  import { PageHeader, Prose } from "../lib/index.ts";
  import home from "../playground/home.md?html";
</script>

<PageHeader title={home.title} />

<Prose as="div" class="doc mt-6">{@html home.html}</Prose>
