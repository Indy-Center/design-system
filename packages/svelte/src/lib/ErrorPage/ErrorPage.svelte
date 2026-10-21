<script lang="ts" module>
  /** One of the app's main pages, offered on a missing page. */
  export type ErrorPageLink = {
    /** The page's name, such as "Events". */
    label: string;
    /** Where it is. */
    href: string;
    /** An MDI path for an icon before the name, such as `mdiCalendar`. */
    icon?: string;
  };

  // SvelteKit's own 404 message, which the title says better.
  const SVELTEKIT_NOT_FOUND = "Not Found";
  // A message that already ends a sentence.
  const ENDS_SENTENCE = /[.!?]$/;
</script>

<script lang="ts">
  import {
    mdiAlertCircleOutline,
    mdiArrowLeft,
    mdiHome,
    mdiRadar,
  } from "@mdi/js";
  import { onMount } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Button from "../Button/Button.svelte";
  import Heading, { labelClasses } from "../Heading/Heading.svelte";
  import Icon from "../Icon/Icon.svelte";
  import IconTile from "../IconTile/IconTile.svelte";

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** The HTTP status, such as `page.status`. */
    status: number;
    /** What went wrong, such as `page.error?.message`. */
    message?: string;
    /** The address that wasn't found, such as `page.url.pathname`. Shown on a 404. */
    path?: string;
    /** Where “Return home” goes. `/` by default. */
    home?: string;
    /** The app's main pages, offered on a 404. */
    links?: ErrorPageLink[];
  };

  let {
    status,
    message,
    path,
    home = "/",
    links = [],
    class: className,
    ...rest
  }: Props = $props();

  const linksId = $props.id();

  let notFound = $derived(status === 404);
  // What a load said was missing, such as "Partner not found".
  let missing = $derived(
    notFound && message && message !== SVELTEKIT_NOT_FOUND
      ? message
      : undefined,
  );
  let title = $derived(
    notFound ? (missing ?? "Radar contact lost") : "Something went wrong",
  );
  // The error's message as a sentence: SvelteKit's ("Internal Error") has
  // no full stop.
  let reason = $derived(
    message
      ? ENDS_SENTENCE.test(message)
        ? message
        : `${message}.`
      : "An unexpected error occurred.",
  );

  // "Go back" needs JavaScript and a page before this one in the tab, so
  // it comes after load: never on the server, nor in a tab opened on the
  // broken link.
  let canGoBack = $state(false);
  onMount(() => {
    canGoBack = history.length > 1;
  });
</script>

<div
  {...rest}
  class={[
    "flex flex-1 flex-col items-center justify-center px-4 py-16 text-center",
    className,
  ]}
>
  <IconTile tone="primary" shape="circle" class="mb-6 size-20">
    <Icon path={notFound ? mdiRadar : mdiAlertCircleOutline} size={40} />
  </IconTile>

  <p
    class="bg-linear-to-b from-foreground to-muted-foreground bg-clip-text font-mono text-7xl font-bold text-transparent sm:text-8xl"
  >
    {status}
  </p>
  <Heading level={1} class="mt-4">{title}</Heading>

  <p class="mt-3 max-w-md leading-relaxed text-muted-foreground">
    {#if notFound}
      We couldn't find the page you were looking for. It may have moved, or the
      link might be wrong.
    {:else}
      {reason} Please try again in a moment.
    {/if}
  </p>

  {#if notFound && path}
    <p
      class="mt-4 max-w-full truncate rounded-md bg-muted px-3 py-1 font-mono text-sm text-foreground-soft"
    >
      {path}
    </p>
  {/if}

  <div class="mt-8 flex flex-wrap justify-center gap-3">
    <Button href={home}><Icon path={mdiHome} />Return home</Button>
    {#if canGoBack}
      <Button variant="secondary" onclick={() => history.back()}
        ><Icon path={mdiArrowLeft} />Go back</Button
      >
    {/if}
  </div>

  {#if notFound && links.length > 0}
    <nav aria-labelledby={linksId} class="mt-10 border-t border-border pt-6">
      <!-- Heading's label look, on a <p>: the page's h1 is its one heading. -->
      <p id={linksId} class={["mb-3", labelClasses]}>Or try one of these</p>
      <ul class="flex flex-wrap justify-center gap-2">
        {#each links as link}
          <li>
            <a
              href={link.href}
              class="flex min-h-11 min-w-11 items-center gap-2 rounded-lg px-3 text-sm text-foreground-soft transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {#if link.icon}<Icon path={link.icon} />{/if}
              {link.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</div>
