<script lang="ts">
  import { mdiAccountCircle, mdiCog, mdiLogout } from "@mdi/js";
  import type { HTMLAttributes } from "svelte/elements";
  import { INDY_CENTER_APPS } from "../AppsMenu/apps.js";
  import ColorSchemeSetting from "../ColorSchemeSetting/ColorSchemeSetting.svelte";
  import Icon from "../Icon/Icon.svelte";
  import Rating from "../Rating/Rating.svelte";
  import TimeZoneSetting from "../TimeZoneSetting/TimeZoneSetting.svelte";
  import { findPilotRating } from "../aviation/ratings.js";
  import HeaderMenu from "../headerMenu/HeaderMenu.svelte";
  import {
    headerButton,
    menuRow,
    signOutRow,
  } from "../headerMenu/headerMenu.js";
  import { withoutTrailingSlash } from "../headerMenu/withoutTrailingSlash.js";
  import { initials } from "./initials.js";

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** The signed-in member's name as the app shows it. */
    name: string;
    /** Their VATSIM CID: `1000001`. */
    cid: number | string;
    /** Their controller rating, as the data source spells it: `5`, `"C1"`. Left out, none shows. */
    rating?: number | string;
    /** Their pilot rating, as the data source spells it: `1`, `"PPL"`. None shows for VATSIM's `0` or when left out. */
    pilotRating?: number | string;
    /** Where Sign out goes: the identity service's sign-out address, with the page to come back to. */
    signOutHref: string;
    /** The hub, where My profile and Settings are. flyindycenter.com by default. */
    hub?: string;
  };

  let {
    name,
    cid,
    rating,
    pilotRating,
    signOutHref,
    hub = INDY_CENTER_APPS[0].href,
    class: className,
    ...rest
  }: Props = $props();

  const letters = $derived(initials(name));
  const hubHref = $derived(withoutTrailingSlash(hub));
  // VATSIM's pilot rating 0 is a member who has none yet.
  const showPilot = $derived(
    pilotRating !== undefined && findPilotRating(pilotRating)?.id !== 0,
  );

  const avatar =
    "flex shrink-0 items-center justify-center rounded-full bg-primary font-heading font-semibold text-primary-foreground";
  const section = "mt-2 border-t border-border pt-2";
</script>

<!-- Dark in both schemes, as the header it sits in: data-theme after the
     caller's attributes so none can override it. -->
<div {...rest} data-theme="dark" class={className}>
  <HeaderMenu
    label="Account: {name}"
    align="end"
    buttonClass={headerButton}
    panelClass="max-h-[calc(100dvh-5rem)] w-80 overflow-y-auto max-sm:fixed max-sm:inset-x-2 max-sm:top-16 max-sm:w-auto"
  >
    {#snippet trigger(open)}
      <span
        class={[
          avatar,
          "size-8 text-xs ring-2",
          open ? "ring-foreground-soft" : "ring-transparent",
        ]}
      >
        {#if letters}{letters}{:else}<Icon
            path={mdiAccountCircle}
            size={20}
          />{/if}
      </span>
    {/snippet}

    <div class="flex items-center gap-3 px-3 py-2">
      <span aria-hidden="true" class={[avatar, "size-10 text-sm"]}
        >{letters}</span
      >
      <div class="min-w-0">
        <p class="text-sm font-semibold break-words text-foreground">
          {name}
        </p>
        <p class="text-xs text-muted-foreground">
          CID <span class="font-mono">{cid}</span>
        </p>
        {#if rating !== undefined || showPilot}
          <p class="mt-1 flex flex-wrap gap-1">
            {#if rating !== undefined}
              <span
                ><span class="sr-only">{"ATC rating "}</span><Rating
                  {rating}
                  focusable
                /></span
              >
            {/if}
            {#if showPilot && pilotRating !== undefined}
              <span
                ><span class="sr-only">{"Pilot rating "}</span><Rating
                  rating={pilotRating}
                  kind="pilot"
                  focusable
                /></span
              >
            {/if}
          </p>
        {/if}
      </div>
    </div>

    <ul class={[section, "space-y-1"]}>
      <li>
        <a href="{hubHref}/profile" class={menuRow}
          ><Icon path={mdiAccountCircle} size={20} />My profile</a
        >
      </li>
      <li>
        <a href="{hubHref}/settings" class={menuRow}
          ><Icon path={mdiCog} size={20} />Settings</a
        >
      </li>
    </ul>

    <div class={section}><TimeZoneSetting /></div>
    <div class={section}><ColorSchemeSetting /></div>

    <div class={section}>
      <a href={signOutHref} class={signOutRow}
        ><Icon path={mdiLogout} size={20} />Sign out</a
      >
    </div>
  </HeaderMenu>
</div>
