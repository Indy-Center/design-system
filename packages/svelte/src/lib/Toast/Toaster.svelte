<script lang="ts">
  import { onMount, tick } from "svelte";
  import CloseButton from "../CloseButton/CloseButton.svelte";
  import SeverityIcon from "../severity/SeverityIcon.svelte";
  import { SEVERITIES } from "../severity/severity.js";
  import { toasts } from "./toast.svelte.js";

  // Readers announce a live region's text when it changes, not always when
  // the region arrives holding it, so the lines go in after mount.
  let mounted = $state(false);
  let section = $state<HTMLElement>();
  let pointerOn = false;

  const STEP = 100;
  onMount(() => {
    mounted = true;
    toasts.restore();
    // The clocks stop while the pointer or focus is on the toasts. Focus is
    // checked on each step, as no event fires when a focused toast is
    // removed.
    const clock = setInterval(() => {
      const focusOn = section?.contains(document.activeElement);
      if (!pointerOn && !focusOn) toasts.tick(STEP);
    }, STEP);
    return () => {
      clearInterval(clock);
      toasts.clear();
    };
  });

  // Escape closes the newest, unless a menu already used it or a modal is
  // open (its Escape closes the modal).
  function onkeydown(event: KeyboardEvent) {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    if (document.querySelector("dialog:modal")) return;
    const newest = toasts.shown[0];
    if (newest) toasts.close(newest.id);
  }

  // Closing a toast from its button moves focus to the next toast's
  // button, so it isn't lost.
  async function close(id: number) {
    const at = toasts.shown.findIndex((t) => t.id === id);
    const hadFocus = section?.contains(document.activeElement);
    toasts.close(id);
    if (!hadFocus) return;
    await tick();
    const buttons = section?.querySelectorAll("button");
    buttons?.[Math.min(at, buttons.length - 1)]?.focus();
  }
</script>

<svelte:window
  {onkeydown}
  onpagehide={() => toasts.save()}
  onpageshow={(event) => event.persisted && toasts.forgetSaved()}
/>

<div class="sr-only" role="status" aria-live="polite">
  {#if mounted}
    {#each toasts.lines.status as line, i (i)}<p>{line}</p>{/each}
  {/if}
</div>
<div class="sr-only" role="alert" aria-live="assertive">
  {#if mounted}
    {#each toasts.lines.alert as line, i (i)}<p>{line}</p>{/each}
  {/if}
</div>

{#if mounted && toasts.shown.length}
  <section
    bind:this={section}
    aria-label="Notifications"
    onpointerenter={() => (pointerOn = true)}
    onpointerleave={() => (pointerOn = false)}
    class="fixed inset-x-4 top-[calc(var(--centerline-header-height,4rem)+1rem)] z-30 sm:left-auto sm:w-96"
  >
    <ol class="flex flex-col gap-2">
      {#each toasts.shown as t (t.id)}
        {@const severity = SEVERITIES[t.level]}
        <li
          class={[
            "relative flex gap-3 overflow-hidden rounded-lg border border-l-4 border-border bg-card px-4 py-3 text-sm shadow-lg",
            severity.rule,
          ]}
        >
          <SeverityIcon level={t.level} />
          <p class="min-w-0 flex-1 text-foreground-soft">
            <span class="font-semibold text-foreground">{severity.label}:</span>
            {t.message}
          </p>
          <CloseButton
            aria-label="Dismiss {t.message}"
            onclick={() => close(t.id)}
          />
        </li>
      {/each}
    </ol>
  </section>
{/if}
