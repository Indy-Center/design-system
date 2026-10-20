<script lang="ts">
  // Frequency with a copy button (variant C).
  import { formatFrequency, spokenFrequency } from "./helpers.ts";

  let { hz }: { hz: number } = $props();
  let copied = $state(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(formatFrequency(hz));
    } catch {
      // Clipboard can be blocked; the prototype only shows the feedback.
    }
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<span class="inline-flex items-center gap-1">
  <span class="font-mono text-foreground tabular-nums"
    >{formatFrequency(hz)}<span class="sr-only">
      ({spokenFrequency(hz)})</span
    ></span
  >
  <button
    type="button"
    onclick={copy}
    aria-label="Copy {formatFrequency(hz)}"
    class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  >
    {#if copied}
      <svg
        viewBox="0 0 20 20"
        class="size-4"
        fill="currentColor"
        aria-hidden="true"
        ><path
          fill-rule="evenodd"
          d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
        /></svg
      >
    {:else}
      <svg
        viewBox="0 0 20 20"
        class="size-4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true"
        ><rect x="7" y="7" width="10" height="10" rx="2" /><path
          d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"
        /></svg
      >
    {/if}
  </button>
  <span role="status" class="text-xs text-muted-foreground"
    >{copied ? "Copied" : ""}</span
  >
</span>
