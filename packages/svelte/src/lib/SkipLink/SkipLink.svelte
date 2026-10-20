<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type Props = HTMLAnchorAttributes & {
    /** The page's main content, as `#id`. `#main` by default. */
    href?: string;
  };

  let { href = "#main", class: className, onclick, ...rest }: Props = $props();

  // Following a `#id` link scrolls but leaves focus behind unless the
  // target can take focus, so the next Tab would land back in the header.
  function focusTarget(
    event: MouseEvent & { currentTarget: HTMLAnchorElement },
  ) {
    onclick?.(event);
    const target = document.getElementById(
      decodeURIComponent(href.replace(/^#/, "")),
    );
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
    target.focus();
  }
</script>

<a
  {href}
  {...rest}
  onclick={focusTarget}
  class={[
    "sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50",
    "focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-md",
    "focus:border focus:border-border focus:bg-card focus:px-4",
    "text-link underline underline-offset-4",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    className,
  ]}>Skip to content</a
>
