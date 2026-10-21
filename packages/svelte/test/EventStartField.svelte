<script lang="ts">
  // A DateTimeInput in a Field, as an event form writes one, with its bound
  // value shown, for DateTimeInput's tests.
  import type { ComponentProps } from "svelte";
  import DateTimeInput from "../src/lib/DateTimeInput/DateTimeInput.svelte";
  import Field from "../src/lib/Field/Field.svelte";

  type Props = Omit<ComponentProps<typeof DateTimeInput>, "value"> & {
    value?: string;
    hint?: string;
    error?: string;
  };
  let { value = $bindable(), hint, error, ...rest }: Props = $props();
</script>

<Field label="Start" {hint} {error}>
  {#snippet children(control)}
    <DateTimeInput {...control} {...rest} bind:value />
  {/snippet}
</Field>
<output data-testid="bound">{value ?? "none"}</output>
