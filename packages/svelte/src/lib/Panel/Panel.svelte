<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Card from "../Card/Card.svelte";
  import Heading from "../Heading/Heading.svelte";

  type Props = HTMLAttributes<HTMLElement> & {
    /** The panel's name, in sentence case: its heading. */
    title: string;
    /** The title's place in the page's outline: `h2` to `h6`. */
    level: 2 | 3 | 4 | 5 | 6;
    /** An icon before the title, such as `<Icon path={mdiRadar} />`. Decorative: hidden from screen readers. */
    icon?: Snippet;
    /** No padding round the body, for content that runs to the edges: a divided list, a table. */
    flush?: boolean;
    /** The body under the title. */
    children: Snippet;
  };

  let {
    title,
    level,
    icon,
    flush = false,
    children,
    ...rest
  }: Props = $props();

  const id = $props.id();
</script>

<Card as="section" flush aria-labelledby={id} {...rest}>
  <div class="flex items-center gap-2 border-b border-border px-4 py-3">
    {#if icon}
      <span
        aria-hidden="true"
        class="flex shrink-0 text-xl text-muted-foreground"
      >
        {@render icon()}
      </span>
    {/if}
    <!-- The h4 look whatever the level, as chosen in ticket 10. -->
    <Heading {level} look={4} {id}>{title}</Heading>
  </div>
  <div class={[!flush && "p-4"]}>{@render children()}</div>
</Card>
