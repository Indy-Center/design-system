<script lang="ts">
  // A doc's page: its title and summary, the doc, then (for a component)
  // the demo below. The layout wraps every component's and helper's page
  // in it.
  import type { Snippet } from "svelte";
  import { Button, Heading, PageHeader, Prose } from "../lib/index.ts";
  import type { Doc } from "./markdown.ts";
  import type { SitePage } from "./site.ts";

  type Props = {
    /** The page, as the sidebar lists it. */
    page: SitePage;
    /** Its doc, drawn; none for a component without one. */
    doc?: Doc;
    /** The demo: the route's own page. */
    children?: Snippet;
  };

  let { page, doc, children }: Props = $props();

  const demo = $derived(page.kind === "component");
</script>

<PageHeader title={page.label}>
  {page.summary}
  {#snippet actions()}
    {#if demo && doc}
      <Button variant="secondary" href="#demo">See the demo</Button>
    {/if}
  {/snippet}
</PageHeader>

{#if doc}
  <Prose as="div" class="doc mt-6">{@html doc.html}</Prose>
{/if}

{#if demo}
  <section aria-labelledby="demo" class={doc && "mt-12"}>
    <Heading level={2} id="demo" class="mb-4">Demo</Heading>
    {@render children?.()}
  </section>
{/if}
