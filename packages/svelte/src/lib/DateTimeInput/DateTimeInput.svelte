<script lang="ts">
  import { onMount } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { textControlClasses } from "../formControl/formControl.js";
  import Time from "../Time/Time.svelte";
  import { fromLocal, toLocal } from "./local.js";

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
    class: className,
    ...rest
  }: Props = $props();

  const madeId = $props.id();
  const inputId = $derived(id ?? madeId);
  const readOutId = $derived(`${inputId}-read-out`);

  // The box holds the member's local time, which only the browser knows;
  // the server leaves it and the read-out empty.
  let memberZone = $state<string>();
  onMount(() => {
    memberZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  // An instant as the box's local text, once the zone is known.
  const inZone = (iso: string | undefined) =>
    memberZone && iso ? toLocal(iso) : "";
  const local = $derived(inZone(value));
</script>

<div class={["flex flex-col gap-1.5", className]}>
  {#if name}
    <input type="hidden" {name} value={value ?? ""} disabled={rest.disabled} />
  {/if}
  <input
    {...rest}
    id={inputId}
    type="datetime-local"
    value={local}
    min={inZone(min) || undefined}
    max={inZone(max) || undefined}
    oninput={(event) => (value = fromLocal(event.currentTarget.value))}
    aria-describedby={[readOutId, callerDescribedBy].filter(Boolean).join(" ")}
    class={textControlClasses}
  />
  <p
    id={readOutId}
    class="flex flex-wrap gap-x-4 text-sm text-muted-foreground"
  >
    {#if local && value}
      <span>Local: <Time {value} show="datetime" /></span>
      <span>Zulu: <Time {value} show="datetime" zone="zulu" /></span>
    {:else if memberZone}
      In your time zone, {memberZone}.
    {/if}
  </p>
</div>
