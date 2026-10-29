<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    /** An icon beside text that says the same. Nothing renders without one. */
    icon?: Snippet;
  };

  let { icon }: Props = $props();
</script>

{#if icon}<span aria-hidden="true" class="inline-flex">{@render icon()}</span
  >{/if}
