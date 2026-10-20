<script lang="ts">
  // Throwaway Alert for the severity prototype.
  import { mdiClose } from "@mdi/js";
  import { onMount } from "svelte";
  import Icon from "./Icon.svelte";
  import {
    box,
    icon,
    spoken,
    text,
    type AlertStyle,
    type IconSet,
    type Level,
  } from "./levels.ts";
  import {
    measure,
    results,
    schemeOf,
    type Measure,
  } from "./contrast.svelte.ts";

  type Props = {
    level: Level; // the severity
    variant?: AlertStyle; // tinted, bordered or filled
    iconSet?: IconSet; // which MDI set
    title?: string; // optional bold first line
    message: string; // the text
    dismissible?: boolean; // shows a close button
    measured?: boolean; // prints contrast under it and records it
  };

  let {
    level,
    variant = "tinted",
    iconSet = "A",
    title,
    message,
    dismissible = false,
    measured = false,
  }: Props = $props();

  let shown = $state(true);
  let root = $state<HTMLElement>();
  let body = $state<HTMLElement>();
  let svg = $state<HTMLElement>();
  let m = $state<{ text: Measure; icon: Measure }>();

  const filled = $derived(variant === "filled");

  onMount(() => {
    if (!measured) return;
    requestAnimationFrame(() => {
      if (!body || !svg || !root) return;
      m = { text: measure(body), icon: measure(svg) };
      results[`${variant}/${level}/${schemeOf(root)}`] = m;
    });
  });

  const mark = (r: number, min: number) => (r >= min ? "pass" : "FAIL");
</script>

{#if shown}
  <div bind:this={root}>
    <div
      class={["flex gap-3 rounded-lg px-4 py-3 text-sm", box[variant][level]]}
    >
      <span bind:this={svg} class={["mt-0.5 shrink-0", !filled && text[level]]}>
        <Icon path={icon(level, iconSet)} />
      </span>
      <div class="min-w-0 flex-1">
        {#if title}
          <p class={["font-semibold", !filled && "text-foreground"]}>
            <span class="sr-only">{spoken[level]}:</span>
            {title}
          </p>
        {/if}
        <p bind:this={body} class={[!filled && "text-foreground-soft"]}>
          {#if !title}<span class="sr-only">{spoken[level]}:</span>{/if}
          {message}
        </p>
      </div>
      {#if dismissible}
        <button
          type="button"
          class="-my-2 -mr-3 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="Dismiss: {title ?? message}"
          onclick={() => (shown = false)}
        >
          <Icon path={mdiClose} />
        </button>
      {/if}
    </div>
    {#if m}
      <p class="mt-1 font-mono text-xs text-muted-foreground">
        text {m.text.ratio.toFixed(2)}:1 {mark(m.text.ratio, 4.5)} · icon
        {m.icon.ratio.toFixed(2)}:1 {mark(m.icon.ratio, 3)}
      </p>
    {/if}
  </div>
{:else}
  <button
    type="button"
    class="min-h-11 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    onclick={() => (shown = true)}>Dismissed. Show it again</button
  >
{/if}
