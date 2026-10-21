<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import CloseButton from "../CloseButton/CloseButton.svelte";
  import SeverityIcon from "../severity/SeverityIcon.svelte";
  import { SEVERITIES, type Severity } from "../severity/severity.js";

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** How serious it is: info, success, caution or danger. */
    level: Severity;
    /** A short bold first line. Optional; the spoken label is read either way. */
    title?: string;
    /** Shows a close button. Off by default. */
    dismissible?: boolean;
    /** Called after the close button hides it. */
    ondismiss?: () => void;
    /** The message. */
    children: Snippet;
  };

  let {
    level,
    title,
    dismissible = false,
    ondismiss,
    children,
    class: className,
    ...rest
  }: Props = $props();

  const severity = $derived(SEVERITIES[level]);
  const id = $props.id();
  let shown = $state(true);

  function dismiss() {
    shown = false;
    ondismiss?.();
  }
</script>

{#if shown}
  <div
    role={severity.live}
    {...rest}
    class={[
      "flex gap-3 rounded-lg border px-4 py-3 text-sm",
      severity.tint,
      className,
    ]}
  >
    <SeverityIcon {level} />
    <div class="min-w-0 flex-1 text-foreground-soft">
      <span class="sr-only">{severity.label}:</span>
      {#if title}
        <p id="{id}-title" class="font-semibold text-foreground">{title}</p>
      {/if}
      <div id="{id}-message">{@render children()}</div>
    </div>
    {#if dismissible}
      <span id="{id}-dismiss" hidden>Dismiss</span>
      <CloseButton
        aria-labelledby="{id}-dismiss {id}-{title ? 'title' : 'message'}"
        onclick={dismiss}
      />
    {/if}
  </div>
{/if}
