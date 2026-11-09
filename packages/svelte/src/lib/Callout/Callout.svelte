<script module lang="ts">
  export type { CalloutLevel } from "../blocks.js";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { CalloutLevel } from "../blocks.js";
  import Icon from "../Icon/Icon.svelte";
  import { CALLOUTS } from "./callout.js";

  type Props = HTMLAttributes<HTMLElement> & {
    /** How it reads: info (Note), caution, danger (Warning) or reference. */
    level: CalloutLevel;
    /** Shown in place of the level's own label; readers hear the level's word, then this. */
    label?: string;
    /** The callout's text: document content, such as paragraphs. */
    children: Snippet;
  };

  let { level, label, children, class: className, ...rest }: Props = $props();

  const callout = $derived(CALLOUTS[level]);
  const id = $props.id();
</script>

<aside
  aria-labelledby="{id}-label"
  {...rest}
  class={["flex gap-3 rounded-lg border px-4 py-3", callout.tint, className]}
>
  <!-- As tall as the label's line, so the icon sits centred on it. -->
  <span class="flex h-[1lh] shrink-0 items-center">
    <Icon path={callout.icon} size={20} class={callout.text} />
  </span>
  <div class="min-w-0 flex-1 text-foreground-soft">
    <p id="{id}-label" class="not-prose font-semibold text-foreground">
      {#if label}
        <!-- A custom label shows alone; readers still hear the level, as in Alert. -->
        <span class="sr-only">{callout.label}:</span>
        {label}
      {:else}
        {callout.label}
      {/if}
    </p>
    <!-- Its content's own margins stay between its parts, not at its edges. -->
    <div class="mt-1 *:first:mt-0 *:last:mb-0">{@render children()}</div>
  </div>
</aside>
