<script module lang="ts">
  import type { Snippet } from "svelte";
  import type { LinkHrefFunction } from "./draw.js";

  /** What every level of the drawing shares. */
  export type Drawing = {
    /** The package's block snippets with the app's over them. */
    blocks: Record<string, Snippet<[Record<string, unknown>]> | undefined>;
    linkHref: LinkHrefFunction | undefined;
    /** Each heading's id, from `documentHeadings`. */
    ids: Map<object, string>;
  };
</script>

<script lang="ts">
  // Draws a list of Lexical nodes, and itself again for their children.
  import { DEV } from "esm-env";
  import Nodes from "./DrawNodes.svelte";
  import { blockContent } from "./headings.js";
  import {
    align,
    blockFields,
    linkAddress,
    listEntries,
    READING_SIZES,
    tableParts,
    textTags,
    uploadDrawing,
    type Cell,
    type TextTag,
  } from "./draw.js";
  import type {
    BlockNode,
    HeadingNode,
    InlineBlockNode,
    LinkNode,
    ListNode,
    ParagraphNode,
    QuoteNode,
    SerializedNode,
    TableNode,
    TextNode,
    UploadNode,
  } from "./nodes.js";

  let { nodes, drawing }: { nodes: SerializedNode[]; drawing: Drawing } =
    $props();

  const KNOWN = new Set([
    "text",
    "tab",
    "linebreak",
    "paragraph",
    "heading",
    "quote",
    "list",
    "horizontalrule",
    "link",
    "autolink",
    "table",
    "upload",
    "block",
    "inlineBlock",
  ]);

  /** Whether an unknown node has children to draw; warns either way. */
  function unknownWithChildren(node: SerializedNode): boolean {
    const children = Array.isArray(node.children) && node.children.length > 0;
    if (DEV) {
      console.warn(
        `RichText: unknown node "${node.type}", ${children ? "drawn as its children" : "left out"}`,
      );
    }
    return children;
  }

  /** The app's or the package's snippet for a block; warns when there's none. */
  function snippetFor(node: BlockNode | InlineBlockNode) {
    const slug = node.fields?.blockType;
    const snippet = slug === undefined ? undefined : drawing.blocks[slug];
    if (!snippet && DEV) {
      console.warn(`RichText: no snippet for the block "${slug}", left out`);
    }
    return snippet;
  }

  const asText = (node: SerializedNode) => node as unknown as TextNode;
  const as = <T,>(node: SerializedNode) => node as unknown as T;
</script>

{#snippet formatted(tags: TextTag[], text: string)}
  {#if tags.length === 0}{text}{:else}<svelte:element this={tags[0]}
      >{@render formatted(tags.slice(1), text)}</svelte:element
    >{/if}
{/snippet}

{#snippet cells(row: Cell[])}
  <tr>
    {#each row as cell, i (i)}
      {#if cell.scope}
        <th
          scope={cell.scope}
          colspan={cell.colspan}
          rowspan={cell.rowspan}
          data-align={align(cell.cell.format)}
          ><Nodes nodes={cell.children} {drawing} /></th
        >
      {:else}
        <td
          colspan={cell.colspan}
          rowspan={cell.rowspan}
          data-align={align(cell.cell.format)}
          ><Nodes nodes={cell.children} {drawing} /></td
        >
      {/if}
    {/each}
  </tr>
{/snippet}

{#snippet list(node: ListNode)}
  <svelte:element
    this={node.listType === "number" ? "ol" : "ul"}
    start={node.listType === "number" && (node.start ?? 1) !== 1
      ? node.start
      : undefined}
    data-align={align(node.format)}
  >
    {#each listEntries(node) as entry, i (i)}
      <li data-align={align(entry.item.format)}>
        {#if node.listType === "check" && entry.children.length > 0}
          <!-- Readers tick it as they go: nothing saves it, and it starts unticked whatever the author left. -->
          <label
            ><input type="checkbox" />
            <Nodes nodes={entry.children} {drawing} /></label
          >
        {:else}
          <Nodes nodes={entry.children} {drawing} />
        {/if}{#each entry.lists as nested, j (j)}
          {@render list(nested)}
        {/each}
      </li>
    {/each}
  </svelte:element>
{/snippet}

{#each nodes as node, i (i)}
  {#if node.type === "text" || node.type === "tab"}
    {@render formatted(textTags(asText(node).format), asText(node).text)}
  {:else if node.type === "linebreak"}
    <br />
  {:else if node.type === "paragraph"}
    {@const paragraph = as<ParagraphNode>(node)}
    {#if paragraph.children?.length}
      <p data-align={align(paragraph.format)}>
        <Nodes nodes={paragraph.children} {drawing} />
      </p>
    {/if}
  {:else if node.type === "heading"}
    {@const heading = as<HeadingNode>(node)}
    <svelte:element
      this={heading.tag}
      id={drawing.ids.get(node)}
      data-align={align(heading.format)}
    >
      <Nodes nodes={heading.children ?? []} {drawing} />
    </svelte:element>
  {:else if node.type === "quote"}
    {@const quote = as<QuoteNode>(node)}
    <blockquote data-align={align(quote.format)}>
      <Nodes nodes={quote.children ?? []} {drawing} />
    </blockquote>
  {:else if node.type === "list"}
    {@render list(as<ListNode>(node))}
  {:else if node.type === "horizontalrule"}
    <hr />
  {:else if node.type === "link" || node.type === "autolink"}
    {@const link = as<LinkNode>(node)}
    {@const href = linkAddress(link.fields ?? {}, drawing.linkHref)}
    {#if href === undefined}
      <Nodes nodes={link.children ?? []} {drawing} />
    {:else if link.fields?.newTab}
      <a {href} target="_blank" rel="noopener noreferrer"
        ><Nodes nodes={link.children ?? []} {drawing} /></a
      >
    {:else}
      <a {href}><Nodes nodes={link.children ?? []} {drawing} /></a>
    {/if}
  {:else if node.type === "table"}
    {@const parts = tableParts(as<TableNode>(node))}
    <table>
      {#if parts.head.length}
        <thead>
          {#each parts.head as row, r (r)}{@render cells(row)}{/each}
        </thead>
      {/if}
      {#if parts.body.length}
        <tbody>
          {#each parts.body as row, r (r)}{@render cells(row)}{/each}
        </tbody>
      {/if}
    </table>
  {:else if node.type === "upload"}
    {@const upload = uploadDrawing(as<UploadNode>(node))}
    {#if upload.kind === "image"}
      <img
        src={upload.src}
        srcset={upload.srcset}
        sizes={upload.srcset ? READING_SIZES : undefined}
        width={upload.width}
        height={upload.height}
        alt={upload.alt}
      />
    {:else if upload.kind === "file"}
      <a href={upload.href}>{upload.name}</a>
    {/if}
  {:else if node.type === "block" || node.type === "inlineBlock"}
    {@const block = as<BlockNode>(node)}
    {@const snippet = snippetFor(block)}
    {#if snippet}
      {@const nested = blockContent(block.fields)}
      {#snippet content()}
        <Nodes nodes={nested?.root.children ?? []} {drawing} />
      {/snippet}
      {@render snippet(
        "content" in block.fields
          ? { ...blockFields(block.fields), content: nested && content }
          : blockFields(block.fields),
      )}
    {/if}
  {:else if !KNOWN.has(node.type) && unknownWithChildren(node)}
    <Nodes nodes={node.children as SerializedNode[]} {drawing} />
  {/if}
{/each}
