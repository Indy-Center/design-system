<script lang="ts" module>
  /** What a credential is, which sets its chip's colour. */
  export type CredentialKind = "certification" | "endorsement" | "solo";
</script>

<script lang="ts">
  import { DEV } from "esm-env";
  import type { HTMLAttributes } from "svelte/elements";
  import AbbrTooltip from "../AbbrTooltip/AbbrTooltip.svelte";
  import Chip from "../Chip/Chip.svelte";
  import { isValid } from "../Time/format.js";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** The short code, as training writes it: `"S-GC"`, `"APP-SOLO"`. */
    code: string;
    /** Its long name: `"Simple Ground Control"`. Without one, the code shows alone. */
    name?: string;
    /** A certification, an endorsement or a solo. */
    kind: CredentialKind;
    /** A solo's expiry: a date (`"2026-11-03"`) or an instant, read in Zulu. */
    until?: Date | string;
    /** Whether it is a tab stop, for places with few credentials (a profile). */
    focusable?: boolean;
  };

  let {
    code,
    name,
    kind,
    until,
    focusable = false,
    class: className,
    ...rest
  }: Props = $props();

  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  });

  // The expiry's day in Zulu, day before month as Time writes dates.
  const expiry = $derived.by(() => {
    if (until === undefined) return undefined;
    const at = new Date(until);
    if (!isValid(at)) return undefined;
    return {
      datetime: at.toISOString().slice(0, 10),
      text: `${at.getUTCDate()} ${month.format(at)}`,
    };
  });

  $effect(() => {
    if (DEV && until !== undefined && !expiry)
      console.warn(`Credential: until ${JSON.stringify(until)} is no date`);
  });
</script>

<!-- The chip's gap spaces it on screen; the space is for copied text. -->
{#snippet expiryText()}{#if expiry}<span class="font-sans font-normal"
      >{" "}<span aria-hidden="true">·</span> until
      <time datetime={expiry.datetime}>{expiry.text}</time></span
    >{/if}{/snippet}

{#if name}
  <AbbrTooltip {code} {name} {focusable} boxClass={className}>
    {#snippet frame(abbr, ring)}
      <Chip {...rest} variant={kind} class={ring}
        >{@render abbr()}{@render expiryText()}</Chip
      >
    {/snippet}
  </AbbrTooltip>
{:else}
  <Chip {...rest} variant={kind} class={className}
    >{code}{@render expiryText()}</Chip
  >
{/if}
