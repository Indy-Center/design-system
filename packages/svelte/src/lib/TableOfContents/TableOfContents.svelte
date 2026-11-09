<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Link from "../Link/Link.svelte";
  import {
    documentHeadings,
    headingId,
    type DocumentHeading,
    type HeadingIdFunction,
  } from "../RichText/headings.js";
  import type { RichTextState } from "../RichText/nodes.js";

  type Props = HTMLAttributes<HTMLElement> & {
    /** The same rich-text field `RichText` draws. */
    content: RichTextState | null | undefined;
    /** The same function given to `RichText`, so the ids match. */
    headingId?: HeadingIdFunction;
    /** Names the navigation for screen readers. "Contents" by default. */
    label?: string;
  };

  let {
    content,
    headingId: id = headingId,
    label = "Contents",
    class: className,
    ...rest
  }: Props = $props();

  // The h2s, each with the h3s after it. An h3 before any h2 stands on its own.
  const sections = $derived.by(() => {
    const result: { heading: DocumentHeading; children: DocumentHeading[] }[] =
      [];
    for (const heading of documentHeadings(content, id)) {
      if (heading.level === 2) result.push({ heading, children: [] });
      else if (heading.level === 3) {
        const last = result.at(-1);
        if (last) last.children.push(heading);
        else result.push({ heading, children: [] });
      }
    }
    return result;
  });

  // A standalone link is a 44px target.
  const target = "inline-flex min-h-11 items-center";
</script>

{#if sections.length > 0}
  <nav aria-label={label} {...rest} class={className}>
    <ol class="text-sm">
      {#each sections as { heading, children } (heading.id)}
        <li>
          <Link href="#{heading.id}" class={target}>{heading.text}</Link>
          {#if children.length > 0}
            <ol class="ms-4">
              {#each children as child (child.id)}
                <li>
                  <Link href="#{child.id}" class={target}>{child.text}</Link>
                </li>
              {/each}
            </ol>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
{/if}
