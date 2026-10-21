<script lang="ts">
  // A DateTimeInput in a Field, as an event form writes one, with its bound
  // value shown, for DateTimeInput's tests. Given `choice`, it hands it to
  // setTimeZone first, as an app's root layout would a saved time zone.
  import type { ComponentProps } from "svelte";
  import DateTimeInput from "../src/lib/DateTimeInput/DateTimeInput.svelte";
  import Field from "../src/lib/Field/Field.svelte";
  import type { TimeZoneChoice } from "../src/lib/timeZone/timeZone.ts";
  import { setTimeZone } from "../src/lib/timeZone/timeZoneContext.svelte.ts";

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
