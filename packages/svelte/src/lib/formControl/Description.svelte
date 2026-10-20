<!-- The hint and error under a control or group, with the ids that
     `describedBy` points at. Renders nothing when both are unset. -->
<script lang="ts">
  import ErrorIcon from "./ErrorIcon.svelte";
  import { descriptionIds, type DescriptionProps } from "./formControl.js";

  type Props = DescriptionProps & {
    /** The base id the hint's and error's ids are made from. */
    id: string;
  };

  let { id, hint, error }: Props = $props();

  const ids = $derived(descriptionIds(id));
</script>

{#if hint}
  <p id={ids.hint} class="text-sm text-muted-foreground">{hint}</p>
{/if}
{#if error}
  <p id={ids.error} class="flex gap-1.5 text-sm text-destructive">
    <ErrorIcon />
    <span>{error}</span>
  </p>
{/if}
