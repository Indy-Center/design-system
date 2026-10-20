<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";
  import {
    closeIcon,
    SEVERITIES,
    type Severity,
  } from "../severity/severity.js";

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
    role={level === "danger" ? "alert" : "status"}
    {...rest}
    class={[
      "flex gap-3 rounded-lg border px-4 py-3 text-sm",
      severity.tint,
      className,
    ]}
  >
    <!-- 20px, the line's height, so each level's shape is clear. -->
    <Icon path={severity.icon} size={20} class={severity.text} />
    <div class="min-w-0 flex-1 text-foreground-soft">
      <span class="sr-only">{severity.label}:</span>
      {#if title}
        <p id="{id}-title" class="font-semibold text-foreground">{title}</p>
      {/if}
      <div id="{id}-message">{@render children()}</div>
    </div>
    {#if dismissible}
      <span id="{id}-dismiss" hidden>Dismiss</span>
      <button
        type="button"
        aria-labelledby="{id}-dismiss {id}-{title ? 'title' : 'message'}"
        class="-my-2 -mr-3 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onclick={dismiss}
      >
        <Icon path={closeIcon} />
      </button>
    {/if}
  </div>
{/if}
