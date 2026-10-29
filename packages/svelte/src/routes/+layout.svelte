<script lang="ts">
  // The reference site's frame: the header, the sidebar, the page (a
  // component's doc above its demo), and the footer.
  //
  // Not Centerline's Header: it always ends in Sign in or the member's
  // menu, and this site has no one to sign in. The bar here keeps its look
  // (the logo to the hub, the site's name to its home) with the internal
  // Logo and header button recipe; Footer and SkipLink fit as they are.
  import "../playground/playground.css";
  import { mdiClose, mdiFormatListBulleted } from "@mdi/js";
  import { page } from "$app/state";
  import type { Snippet } from "svelte";
  import { Footer, Icon, SkipLink } from "../lib/index.ts";
  import Logo from "../lib/Logo/Logo.svelte";
  import { dismiss } from "../lib/dismiss/dismiss.ts";
  import { headerButton } from "../lib/headerMenu/headerMenu.ts";
  import DocPage from "../playground/DocPage.svelte";
  import Sidebar from "../playground/Sidebar.svelte";
  import { sections, titleOf } from "../playground/site.ts";
  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  // Below lg, the sidebar shows from the Contents button.
  let open = $state(false);
  let button = $state<HTMLButtonElement>();

  const brandLink = [
    "inline-flex min-h-11 min-w-11 items-center rounded-lg px-1",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  ];

  const columns = [
    {
      heading: "Centerline",
      links: [
        { href: "/", label: "Home" },
        { href: "/tokens", label: "Tokens" },
        { href: "/llms.txt", label: "llms.txt" },
      ],
    },
    {
      heading: "Indy Center",
      links: [
        {
          href: "https://tech.flyindycenter.com/design/",
          label: "Design rules",
        },
        { href: "https://brand.flyindycenter.com", label: "Brand guide" },
        { href: "https://flyindycenter.com", label: "Community site" },
      ],
    },
    {
      heading: "Code",
      links: [
        {
          href: "https://github.com/Indy-Center/design-system",
          label: "GitHub",
        },
        {
          href: "https://www.npmjs.com/package/@indy-center/centerline-svelte",
          label: "npm",
        },
      ],
    },
  ];
</script>

<svelte:head><title>{titleOf(data.page)}</title></svelte:head>

<div
  class="flex min-h-screen flex-col bg-background font-sans text-foreground-soft"
>
  <header
    data-theme="dark"
    class="sticky top-0 z-40 border-b border-border bg-background"
  >
    <SkipLink />
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-2 px-2">
      <div class="flex min-w-0 items-center gap-1">
        <a
          href="https://flyindycenter.com"
          aria-label="Indy Center home"
          class={brandLink}
        >
          <Logo mark class="h-9 w-auto text-foreground sm:hidden" />
          <Logo class="h-8 w-auto text-foreground max-sm:hidden" />
        </a>
        <span aria-hidden="true" class="mx-1 h-6 w-px shrink-0 bg-border"
        ></span>
        <a
          href="/"
          class={[
            brandLink,
            "text-lg font-semibold text-foreground underline-offset-4 hover:underline",
          ]}>Centerline</a
        >
      </div>
      <div class="ml-auto flex items-center gap-1">
        <a
          href="https://tech.flyindycenter.com/design/"
          class={[headerButton, "max-sm:hidden"]}>Rules</a
        >
        <a
          href="https://brand.flyindycenter.com"
          class={[headerButton, "max-sm:hidden"]}>Brand guide</a
        >
        <button
          bind:this={button}
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          class={[headerButton, "cursor-pointer lg:hidden"]}
          onclick={() => (open = !open)}
          ><Icon
            path={open ? mdiClose : mdiFormatListBulleted}
            size={20}
          />Contents</button
        >
      </div>
    </div>
  </header>

  <div class="mx-auto flex w-full max-w-7xl flex-1">
    <!-- From lg a fixed 16rem beside the page, scrolling by itself; below
         that, over the page under the header while open. -->
    <aside
      use:dismiss={{ open, trigger: button, onclose: () => (open = false) }}
      class={[
        "shrink-0 overflow-y-auto bg-background px-2 py-6",
        "lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:w-64",
        "max-lg:fixed max-lg:inset-x-0 max-lg:top-16 max-lg:bottom-0 max-lg:z-30",
        !open && "max-lg:hidden",
      ]}
    >
      <Sidebar id="site-nav" {sections} current={page.url.pathname} {open} />
    </aside>

    <main id="main" class="min-w-0 flex-1 px-4 py-6 lg:px-8">
      {#if data.page && data.page.kind !== "site"}
        <DocPage page={data.page} doc={data.doc}>{@render children()}</DocPage>
      {:else}
        {@render children()}
      {/if}
    </main>
  </div>

  <Footer {columns} />
</div>
