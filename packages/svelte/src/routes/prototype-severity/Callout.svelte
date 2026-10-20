<script lang="ts">
  // Throwaway Callout for the documents feature, inside prose.
  import { onMount } from "svelte";
  import Icon from "./Icon.svelte";
  import { faa, icon, spoken, text, type CalloutLevel } from "./levels.ts";
  import { measure, type Measure } from "./contrast.svelte.ts";

  type Props = {
    level: CalloutLevel; // the severity, or reference
    variant: "A" | "B"; // A: an Alert in the text; B: FAA label and rule
    message: string; // the text
  };
  let { level, variant, message }: Props = $props();

  const tint: Record<CalloutLevel, string> = {
    info: "border border-info/40 bg-info/10",
    success: "border border-success/40 bg-success/10",
    caution: "border border-warning/40 bg-warning/10",
    danger: "border border-destructive/40 bg-destructive/10",
    reference: "border border-border bg-muted/60",
  };
  const rule: Record<CalloutLevel, string> = {
    info: "border-l-info",
    success: "border-l-success",
    caution: "border-l-warning",
    danger: "border-l-destructive",
    reference: "border-l-input",
  };

  let label = $state<HTMLElement>();
  let svg = $state<HTMLElement>();
  let m = $state<{ label: Measure; icon: Measure }>();
  onMount(() =>
    requestAnimationFrame(() => {
      if (label && svg) m = { label: measure(label), icon: measure(svg) };
    }),
  );
</script>

{#if variant === "A"}
  <aside class={["my-4 flex gap-3 rounded-lg px-4 py-3 text-sm", tint[level]]}>
    <span bind:this={svg} class={["mt-0.5 shrink-0", text[level]]}>
      <Icon path={icon(level)} />
    </span>
    <p class="text-foreground-soft">
      <strong bind:this={label} class="font-semibold text-foreground"
        >{spoken[level]}:</strong
      >
      {message}
    </p>
  </aside>
{:else}
  <aside class={["my-4 border-l-4 py-1 pl-4", rule[level]]}>
    <p
      bind:this={label}
      class={[
        "flex items-center gap-2 text-xs font-bold tracking-wider uppercase",
        text[level],
      ]}
    >
      <span bind:this={svg}><Icon path={icon(level)} size={18} /></span>
      {faa[level]}
    </p>
    <p class="mt-1 text-foreground-soft">{message}</p>
  </aside>
{/if}
{#if m}
  <p class="-mt-3 mb-4 font-mono text-xs text-muted-foreground">
    label {m.label.ratio.toFixed(2)}:1 {m.label.ratio >= 4.5 ? "pass" : "FAIL"} ·
    icon {m.icon.ratio.toFixed(2)}:1 {m.icon.ratio >= 3 ? "pass" : "FAIL"}
  </p>
{/if}
