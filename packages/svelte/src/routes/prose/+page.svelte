<script lang="ts">
  import { Prose } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import { lessonHtml } from "../../../test/lesson.ts";
</script>

<svelte:head><title>Prose · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Prose</h1>

<Schemes>
  <Prose>{@html lessonHtml}</Prose>
</Schemes>
