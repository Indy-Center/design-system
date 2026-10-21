<!-- Stands in for an app's root layout in the time-zone tests: hands the
     server's choice to setTimeZone, and shows what the page would. -->
<script lang="ts">
  import Time from "../Time/Time.svelte";
  import TimeZoneLine from "../TimeZoneLine/TimeZoneLine.svelte";
  import TimeZoneSetting from "../TimeZoneSetting/TimeZoneSetting.svelte";
  import type { TimeZoneChoice, TimeZoneProfileSetting } from "./timeZone.js";
  import { setTimeZone } from "./timeZoneContext.svelte.js";

  type Props = {
    /** As the server load's `readTimeZone` gave it. */
    choice?: TimeZoneChoice;
    /** Passed on as setTimeZone's option, for a signed-in member. */
    saveToProfile?: (setting: TimeZoneProfileSetting) => unknown;
    /** Show the setting above the times; a number shows that many. */
    controls?: boolean | number;
    /** Show the line above the times. */
    line?: boolean;
    /** The instant each `Time` shows, and their `zone` props. */
    value?: string;
    zones?: ("local" | "both" | "zulu")[];
  };

  let {
    choice,
    saveToProfile,
    controls = false,
    line = false,
    value = "2026-10-20T23:00:00Z",
    zones = ["local"],
  }: Props = $props();
  // As an app's layout: signing in or out loads the page again.
  // svelte-ignore state_referenced_locally
  setTimeZone(() => choice, { saveToProfile });
</script>

{#each { length: Number(controls) }, i (i)}
  <TimeZoneSetting />
{/each}
{#if line}
  <TimeZoneLine />
{/if}
<ul>
  {#each zones as zone (zone)}
    <li data-zone={zone}><Time {value} {zone} /></li>
  {/each}
</ul>
