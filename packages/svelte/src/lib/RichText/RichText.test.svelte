<script lang="ts">
  // RichText with an app's own snippet for every block slug its tests use,
  // each showing the fields it got and drawing its content.
  import type { ComponentProps, Snippet } from "svelte";
  import RichText from "./RichText.svelte";

  let props: Omit<ComponentProps<typeof RichText>, "blocks"> = $props();

  /** A field's value as the snippet got it, `undefined` spelled out. */
  const shown = (fields: Record<string, unknown>) =>
    Object.entries(fields)
      .map(([key, value]) =>
        value === undefined
          ? `${key}: undefined`
          : `${key}: ${JSON.stringify(value)}`,
      )
      .join("; ");
</script>

{#snippet block({
  content,
  ...fields
}: {
  content?: Snippet;
  [field: string]: unknown;
})}
  <aside aria-label="Block">
    <code>{shown(fields)}</code>
    {#if content}<div>{@render content()}</div>{/if}
  </aside>
{/snippet}

{#snippet inline(fields: Record<string, unknown>)}
  <mark>{shown(fields)}</mark>
{/snippet}

<RichText
  {...props}
  blocks={{
    callout: block,
    disclosure: block,
    airport: inline,
    citation: inline,
    frequency: inline,
    position: inline,
    rating: inline,
    flightCategory: inline,
    time: inline,
  }}
/>
