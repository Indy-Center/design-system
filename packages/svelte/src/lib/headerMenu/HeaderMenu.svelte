<!-- A header disclosure: a button that shows and hides a panel under it.
     Shared by AppsMenu, AppNav's groups and UserMenu; not exported. Closes
     on Escape and a tap outside (the dismiss action), when focus Tabs out
     of it, and when a link in the panel is followed, so the menu doesn't
     stay open over the next page.
     No menu roles: the panel is a list of links. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import { dismiss } from "../dismiss/dismiss.js";
  import { closeOnFocusOut, closeOnLink } from "./headerMenu.js";

  type Props = {
    /** The button's content; given whether the panel is open. */
    trigger: Snippet<[open: boolean]>;
    /** The panel's content. */
    children: Snippet;
    /** Names the button when its content has no text, as UserMenu's initials (39). */
    label?: string;
    /** Which edge of the button the panel lines up with. */
    align?: "start" | "end";
    /** The button's classes, focus ring included: `barItem`. */
    buttonClass?: ClassValue;
    /** The panel's classes, for its width and placement. */
    panelClass?: ClassValue;
  };

  let {
    trigger,
    children,
    label,
    align = "start",
    buttonClass,
    panelClass,
  }: Props = $props();

  let open = $state(false);
  let button = $state<HTMLButtonElement>();
  const uid = $props.id();
  const id = `header-menu-${uid}`;

  const close = () => (open = false);
  // On the wrapper, which holds both the button and the panel.
  const onfocusout = closeOnFocusOut(close);
  const onclick = closeOnLink(close);
</script>

<div class="relative" {onfocusout}>
  <button
    bind:this={button}
    type="button"
    aria-expanded={open}
    aria-controls={id}
    aria-label={label}
    class={["cursor-pointer", buttonClass]}
    onclick={() => (open = !open)}>{@render trigger(open)}</button
  >
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions: the
       click only listens for a link being followed, which the keyboard does
       too (Enter on a link is a click). -->
  <div
    {id}
    hidden={!open}
    use:dismiss={{ open, trigger: button, onclose: close }}
    {onclick}
    class={[
      "absolute top-full z-50 mt-2 rounded-lg border border-border bg-card p-2 shadow-xl",
      align === "end" ? "right-0" : "left-0",
      panelClass,
    ]}
  >
    {@render children()}
  </div>
</div>
