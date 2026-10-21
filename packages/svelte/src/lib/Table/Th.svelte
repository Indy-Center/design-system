<script lang="ts" module>
  /** Which cells a header names: its column, its row, or a group of either. */
  export type ThScope = "col" | "row" | "colgroup" | "rowgroup";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLThAttributes } from "svelte/elements";

  type Props = HTMLThAttributes & {
    /** Which cells this header names. */
    scope: ThScope;
    /** The header's text. */
    children: Snippet;
  };

  let { scope, children, ...rest }: Props = $props();
</script>

<th {scope} {...rest}>{@render children()}</th>
