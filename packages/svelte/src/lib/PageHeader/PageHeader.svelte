<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Heading from "../Heading/Heading.svelte";
  import Text from "../Text/Text.svelte";

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** The page's title: its `h1`. */
    title: string;
    /** The lead line under the title: one sentence on what the page is for. */
    children?: Snippet;
    /** Buttons or links for the page, such as "New event": on the right, under the title on a phone. */
    actions?: Snippet;
  };

  let { title, children, actions, class: className, ...rest }: Props = $props();
</script>

<!-- A div, not <header>: outside <main> a header is the page's banner. -->
<div
  {...rest}
  class={[
    "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
    className,
  ]}
>
  <div class="min-w-0">
    <Heading level={1}>{title}</Heading>
    {#if children}
      <Text lead class="mt-2">{@render children()}</Text>
    {/if}
  </div>
  {#if actions}
    <div class="flex shrink-0 flex-wrap gap-2">{@render actions()}</div>
  {/if}
</div>
