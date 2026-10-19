<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type Props = HTMLAnchorAttributes & {
    /** Where the link goes. */
    href: string;
    /** The link's text. */
    children: Snippet;
  };

  let { href, children, class: className, ...rest }: Props = $props();
</script>

<a
  {href}
  {...rest}
  class={[
    "rounded-sm text-link underline underline-offset-4 hover:decoration-2",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    className,
  ]}>{@render children()}</a
>
