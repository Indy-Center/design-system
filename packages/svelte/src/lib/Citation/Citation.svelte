<script module lang="ts">
  /** The document a citation points at, as the CMS populates it. */
  export type CitationSource = {
    /** The document's name: "JO 7110.65". */
    name: string;
    /** Its edition, written as the source writes it: "BB", "Change 3". */
    edition?: string;
    /** Where the document is read. */
    url?: string;
    /** The file attached to the source, read when there is no `url`. */
    file?: { url?: string };
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Link from "../Link/Link.svelte";
  import { isTrustedUrl } from "../RichText/draw.js";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** The source: `{ name: "JO 7110.65", edition: "BB", url: "https://…" }`. */
    source: CitationSource;
    /** The place in it, as the source numbers it: "3-7-2", "Chapter 4". */
    at?: string;
  };

  // `class` and `...rest` go on the outer `<span>`.
  let { source, at, class: className, ...rest }: Props = $props();

  // The source's page, or else its file; with neither, or one that isn't
  // relative or http, https, mailto or tel, `at` is plain text.
  const address = $derived(source.url || source.file?.url || undefined);
  const href = $derived(address && isTrustedUrl(address) ? address : undefined);
</script>

<span {...rest} class={className}
  ><cite>{source.name}{source.edition ? ` ${source.edition}` : ""}</cite
  >{#if at}{" "}{#if href}<Link {href}>{at}</Link>{:else}{at}{/if}{/if}</span
>
