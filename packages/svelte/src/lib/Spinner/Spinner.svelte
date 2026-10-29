<script lang="ts">
  import { onMount } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** What is happening, spoken by screen readers. "Loading" by default. */
    label?: string;
  };

  let { label = "Loading", class: className, ...rest }: Props = $props();

  // Readers announce a live region's text when it changes, not always when
  // the region arrives holding it, so the label goes in after mount.
  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });
</script>

<span role="status" {...rest} class={["inline-flex", className]}>
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke-width="3"
    aria-hidden="true"
    class="shrink-0 animate-spin stroke-current motion-reduce:animate-none"
  >
    <circle cx="12" cy="12" r="10" class="opacity-25" />
    <circle
      cx="12"
      cy="12"
      r="10"
      pathLength="100"
      stroke-dasharray="25 75"
      stroke-linecap="round"
    />
  </svg>
  <span class="sr-only">{mounted ? label : ""}</span>
</span>
