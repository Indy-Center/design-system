<script lang="ts" module>
  import type { ComponentProps } from "svelte";
  import UserMenu from "../UserMenu/UserMenu.svelte";

  /** The signed-in member: UserMenu's props for who they are. */
  export type HeaderMember = Pick<
    ComponentProps<typeof UserMenu>,
    "name" | "cid" | "rating" | "pilotRating"
  >;
</script>

<script lang="ts">
  import { mdiClose, mdiLogin, mdiMenu } from "@mdi/js";
  import type { HTMLAttributes } from "svelte/elements";
  import AppNav from "../AppNav/AppNav.svelte";
  import AppNavMenu from "../AppNav/AppNavMenu.svelte";
  import type { NavItem } from "../AppNav/nav.js";
  import AppsMenu, { type App } from "../AppsMenu/AppsMenu.svelte";
  import { INDY_CENTER_APPS } from "../AppsMenu/apps.js";
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";
  import Logo from "../Logo/Logo.svelte";
  import SkipLink from "../SkipLink/SkipLink.svelte";
  import { dismiss } from "../dismiss/dismiss.js";
  import {
    closeOnFocusOut,
    closeOnLink,
    headerButton,
  } from "../headerMenu/headerMenu.js";
  import { INDY_CENTER_DOMAIN } from "../preferenceCookie/preferenceCookie.js";

  type Props = HTMLAttributes<HTMLElement> & {
    /**
     * The app this page is in, as `INDY_CENTER_APPS` lists it: its name and
     * home. Left out on the hub, which shows the logo alone.
     */
    app?: App;
    /** The app's pages and groups, in order. None: no navigation or phone menu. */
    nav?: NavItem[];
    /** The page's path, such as `page.url.pathname`, marking the current page in `nav`. */
    current?: string;
    /** The apps in the Apps menu. `INDY_CENTER_APPS` by default. */
    apps?: readonly App[];
    /** The signed-in member. Left out, the Sign in button shows instead of UserMenu. */
    member?: HeaderMember;
    /** Where Sign in goes: identity's sign-in address, with the page to come back to. */
    signInHref: string;
    /** Where Sign out goes: identity's sign-out address, with the page to come back to. */
    signOutHref: string;
    /** The hub, where the logo goes. flyindycenter.com by default. */
    hub?: string;
    /** The page's main content, as `#id`, for the skip link. `#main` by default. */
    skipTo?: string;
  };

  let {
    app,
    nav = [],
    current,
    apps = INDY_CENTER_APPS,
    member,
    signInHref,
    signOutHref,
    hub = `https://${INDY_CENTER_DOMAIN}`,
    skipTo = "#main",
    class: className,
    ...rest
  }: Props = $props();

  let open = $state(false);
  let menuButton = $state<HTMLButtonElement>();
  const uid = $props.id();
  const id = `phone-menu-${uid}`;

  // The phone menu closes as the header's other menus do: on a followed
  // link, and on Tabbing out of it (back to its button isn't out).
  const close = () => (open = false);
  const onclick = closeOnLink(close);
  const onfocusout = closeOnFocusOut(close, () => menuButton);

  const brandLink = [
    "inline-flex min-h-11 min-w-11 items-center rounded-lg px-1",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  ];
</script>

<!-- Dark in both schemes: the roles inside follow data-theme="dark", set
     after the caller's attributes so none can override it. Takes its own
     64px in the page's flow; no backdrop-filter, which would change what the
     phone panels' `fixed top-16` measures from. -->
<header
  {...rest}
  data-theme="dark"
  class={["sticky top-0 z-40 border-b border-border bg-background", className]}
>
  <SkipLink href={skipTo} />

  <div class="mx-auto flex h-16 max-w-7xl items-center gap-2 px-2">
    <!-- The mark (phones) or logo to the hub, then the app's name to its
         home. From lg a fixed 16rem, so the nav starts in the same place in
         every app; a longer name is cut short. -->
    <div class="flex min-w-0 items-center gap-1 lg:w-64 lg:shrink-0">
      <a href={hub} aria-label="Indy Center home" class={brandLink}>
        <Logo mark class="h-9 w-auto text-foreground sm:hidden" />
        <Logo class="h-8 w-auto text-foreground max-sm:hidden" />
      </a>
      {#if app}
        <span aria-hidden="true" class="mx-1 h-6 w-px shrink-0 bg-border"
        ></span>
        <a
          href={app.href}
          title={app.label}
          class={[
            brandLink,
            "min-w-0 text-lg font-semibold whitespace-nowrap text-foreground underline-offset-4 hover:underline",
          ]}><span class="truncate">{app.label}</span></a
        >
      {/if}
    </div>

    {#if nav.length}
      <AppNav items={nav} {current} class="max-lg:hidden" />
    {/if}

    <div class="ml-auto flex shrink-0 items-center gap-1">
      <AppsMenu {apps} current={app?.href ?? hub} />
      <!-- UserMenu stays in the bar at every width: it has no body for the
           phone menu. -->
      {#if member}
        <UserMenu {...member} {signOutHref} {hub} />
      {:else}
        <!-- One span for the words, so Button's gap doesn't split them.
             "with VATSIM" shows from xl: from lg the nav takes the room. -->
        <Button href={signInHref} size="sm"
          ><Icon path={mdiLogin} size={16} /><span
            >Sign in<span class="max-xl:sr-only">{" with VATSIM"}</span></span
          ></Button
        >
      {/if}
      {#if nav.length}
        <button
          bind:this={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          aria-label="Menu"
          class={["cursor-pointer lg:hidden", headerButton]}
          onclick={() => (open = !open)}
          ><Icon path={open ? mdiClose : mdiMenu} size={24} /></button
        >
      {/if}
    </div>
  </div>

  {#if nav.length}
    <!-- The phone menu: the app's navigation, below lg. It scrolls when
         taller than the screen; its padding, and the same scroll padding
         for a row Tabbed into view, leave room for the rows' outset focus
         ring. -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions: the
         click only listens for a link being followed, which the keyboard
         does too. -->
    <div
      {id}
      hidden={!open}
      use:dismiss={{ open, trigger: menuButton, onclose: close }}
      {onclick}
      {onfocusout}
      class="max-h-[calc(100dvh-4rem)] scroll-py-2 overflow-y-auto border-t border-border p-2 lg:hidden"
    >
      <AppNavMenu items={nav} {current} class="mx-auto max-w-7xl" />
    </div>
  {/if}
</header>
