<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { textControlClasses } from "../formControl/formControl.js";
  import Time from "../Time/Time.svelte";
  import { memberZone } from "../timeZone/memberZone.svelte.js";
  import { fromLocal, toLocal, toUtc, zoneName } from "./local.js";

  type Props = Omit<
    HTMLInputAttributes,
    "type" | "value" | "name" | "min" | "max"
  > & {
    /** The instant, as an ISO string in UTC; bindable. */
    value?: string;
    /** Sends the value, in UTC, with a form under this name. */
    name?: string;
    /** The earliest instant allowed, as an ISO string in UTC. */
    min?: string;
    /** The latest instant allowed, as an ISO string in UTC. */
    max?: string;
  };

  let {
    value = $bindable(),
    name,
    min,
    max,
    id,
    "aria-describedby": callerDescribedBy,
    oninput,
    class: className,
    ...rest
  }: Props = $props();

  const madeId = $props.id();
  const inputId = $derived(id ?? madeId);
  const readOutId = $derived(`${inputId}-read-out`);
  // The read-out first, as it sits above Field's hint and error (formControl's
  // `describedBy` puts the caller's ids first).
  const describedBy = $derived(
    [readOutId, callerDescribedBy].filter(Boolean).join(" "),
  );

  // The box holds the time in the member's zone, the one `Time` shows in
  // the read-out: the saved zone, the device's, or Zulu's when they chose
  // Zulu. The server leaves the box and the read-out empty.
  const member = memberZone();
  const boxZone = $derived(
    member.mounted ? (member.zulu ? "UTC" : member.zone) : undefined,
  );

  // An instant as the box's text, once the zone is known.
  const inZone = (iso: string | undefined) =>
    boxZone && iso ? toLocal(iso, boxZone) : "";
  const local = $derived(inZone(value));
</script>

<div class={["flex flex-col gap-1.5", className]}>
  {#if name}
    <input
      type="hidden"
      {name}
      value={value ? toUtc(value) : ""}
      form={rest.form}
      disabled={rest.disabled}
    />
  {/if}
  <input
    {...rest}
    id={inputId}
    type="datetime-local"
    value={local}
    min={inZone(min) || undefined}
    max={inZone(max) || undefined}
    oninput={(event) => {
      // Typing comes after mount, so the zone is known by then.
      value = boxZone && fromLocal(event.currentTarget.value, boxZone);
      oninput?.(event);
    }}
    aria-describedby={describedBy}
    class={textControlClasses}
  />
  <p
    id={readOutId}
    class="flex flex-wrap gap-x-4 text-sm text-muted-foreground"
  >
    {#if local && value}
      <!-- Under Zulu, Time draws local times in Zulu too: one line will do. -->
      {#if !member.zulu}
        <span>Local: <Time {value} show="datetime" /></span>
      {/if}
      <span>Zulu: <Time {value} show="datetime" zone="zulu" /></span>
    {:else if boxZone}
      In your time zone, {zoneName(boxZone)}.
    {/if}
  </p>
</div>
