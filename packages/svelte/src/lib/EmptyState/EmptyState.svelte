<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Heading from "../Heading/Heading.svelte";

  type Large = HTMLAttributes<HTMLDivElement> & {
    /** `large` for a page or panel with nothing in it; `inline` for one line in a list or table. `large` by default. */
    size?: "large";
    /** What is missing, such as "No events scheduled". */
    title: string;
    /** The title's place in the page's outline: one below the heading it sits under. */
    level: 2 | 3 | 4 | 5 | 6;
    /** An icon above the title, such as `<Icon path={mdiCalendar} />`. Decorative: hidden from screen readers. */
    icon?: Snippet;
    /** Why it is empty, or what to do: a sentence or two. */
    children?: Snippet;
    /** What to do about it: a Button, such as "Add positions". */
    action?: Snippet;
  };

  type Inline = HTMLAttributes<HTMLParagraphElement> & {
    /** One line, in a list, table or menu that has nothing in it. */
    size: "inline";
    /** The line, such as "No sessions yet." */
    children: Snippet;
    /** Not inline: the line says it all. */
    title?: never;
    /** Not inline: the line is no heading. */
    level?: never;
    /** Not inline: no room for one. */
    icon?: never;
    /** Not inline: put a link in the line instead. */
    action?: never;
  };

  type Props = Large | Inline;

  let {
    size = "large",
    title,
    level,
    icon,
    children,
    action,
    class: className,
    ...rest
  }: Props = $props();
</script>

{#if size === "inline"}
  <p {...rest} class={["text-sm text-muted-foreground", className]}>
    {@render children?.()}
  </p>
{:else}
  <div
    {...rest}
    class={["flex flex-col items-center px-4 py-12 text-center", className]}
  >
    {#if icon}
      <div
        aria-hidden="true"
        class="mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-3xl text-muted-foreground"
      >
        {@render icon()}
      </div>
    {/if}
    <!-- Heading's look 3, whatever the level: an empty state is no section title. -->
    <Heading level={level!} look={3}>{title}</Heading>
    {#if children}
      <div class="mt-2 max-w-md text-muted-foreground">
        {@render children()}
      </div>
    {/if}
    {#if action}
      <div class="mt-6">{@render action()}</div>
    {/if}
  </div>
{/if}
