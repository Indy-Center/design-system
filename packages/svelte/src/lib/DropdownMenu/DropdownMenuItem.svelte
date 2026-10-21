<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";

  type AsButton = HTMLButtonAttributes & {
    /** Leave out for a button; give it to make a link. */
    href?: undefined;
    /** The row's words. */
    children: Snippet;
  };

  type AsLink = HTMLAnchorAttributes & {
    /** Where the link goes. */
    href: string;
    /** The row's words. */
    children: Snippet;
  };

  type Props = AsButton | AsLink;

  let { href, children, class: className, ...rest }: Props = $props();
</script>

<!-- A row in a DropdownMenu: a link to go somewhere, a button to do
     something. Choosing it closes the menu. -->
<svelte:element
  this={href === undefined ? "button" : "a"}
  type={href === undefined ? "button" : undefined}
  {href}
  {...rest}
  class={[
    "flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-foreground hover:bg-muted",
    // Inset, so the panel's overflow-hidden doesn't clip it (CONVENTIONS,
    // Focus).
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-60",
    className,
  ]}
>
  {@render children()}
</svelte:element>
