<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Heading from "../Heading/Heading.svelte";

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** The page's title: its `h1`. */
    title: string;
    /** `compact` for a shorter band, such as a signed-in home page. `default` by default. */
    size?: "default" | "compact";
    /** What goes under the title: a lead line, badges, buttons. */
    children?: Snippet;
  };

  let {
    title,
    size = "default",
    children,
    class: className,
    ...rest
  }: Props = $props();

  const sizes = {
    default: "py-16 sm:py-20",
    compact: "py-8 sm:py-10",
  };
</script>

<div
  {...rest}
  class={[
    "relative overflow-hidden bg-linear-to-b from-card to-background",
    className,
  ]}
>
  <!-- The halftone: 1px dots every 20px, in the foreground role at 12%. -->
  <div
    aria-hidden="true"
    class="absolute inset-0 bg-[image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-size-[20px_20px] text-foreground/12"
  ></div>
  <div
    class={[
      "relative mx-auto max-w-6xl px-4 text-center text-foreground-soft",
      sizes[size],
    ]}
  >
    <!-- Heading's look 1 (3xl), as PageHeader's title. -->
    <Heading level={1}>{title}</Heading>
    {#if children}
      <div class="mt-3">{@render children()}</div>
    {/if}
  </div>
</div>
