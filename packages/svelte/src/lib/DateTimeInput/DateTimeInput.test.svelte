<script lang="ts">
  // A DateTimeInput in a Field, as an event form writes one, with its bound
  // value shown, for DateTimeInput's tests. Given `choice`, it hands it to
  // setTimeZone first, as an app's root layout would a saved time zone.
  import type { ComponentProps } from "svelte";
  import Field from "../Field/Field.svelte";
  import type { TimeZoneChoice } from "../timeZone/timeZone.js";
  import { setTimeZone } from "../timeZone/timeZoneContext.svelte.js";
  import DateTimeInput from "./DateTimeInput.svelte";

  type Props = Omit<ComponentProps<typeof DateTimeInput>, "value"> & {
    value?: string;
    hint?: string;
    error?: string;
    choice?: TimeZoneChoice;
  };
  let { value = $bindable(), hint, error, choice, ...rest }: Props = $props();
  // svelte-ignore state_referenced_locally
  if (choice) setTimeZone(() => choice);
</script>

<Field label="Start" {hint} {error}>
  {#snippet children(control)}
    <DateTimeInput {...control} {...rest} bind:value />
  {/snippet}
</Field>
<output data-testid="bound">{value ?? "none"}</output>
