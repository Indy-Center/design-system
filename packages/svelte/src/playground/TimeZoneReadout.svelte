<!-- For the time-zone pages: what the cookie and a pretend profile hold, a
     few times to watch, and a way back to nothing saved. -->
<script lang="ts">
  import { onMount } from "svelte";
  import { Time } from "../lib/index.ts";
  import { readPreferenceCookie } from "../lib/preferenceCookie/preferenceCookie.ts";
  import { COOKIE_NAME } from "../lib/timeZone/timeZone.ts";
  import { forgetTimeZone } from "./forgetTimeZone.ts";

  type Props = {
    /** What the pretend profile holds, as the page's saveToProfile set it. */
    profile: string | undefined;
  };

  let { profile }: Props = $props();

  let cookie = $state<string>();
  function read() {
    cookie = readPreferenceCookie(COOKIE_NAME) ?? "nothing";
  }
  onMount(() => {
    read();
    // The cookie changes on a choice, and when following the device.
    const timer = setInterval(read, 500);
    return () => clearInterval(timer);
  });

  function forget() {
    forgetTimeZone();
    location.reload();
  }

  // Tonight's event, from the next whole hour.
  const hour = 3_600_000;
  const start = Math.ceil(Date.now() / hour) * hour + 2 * hour;
</script>

<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
  <dt class="font-semibold text-foreground">Cookie</dt>
  <dd class="font-mono break-all">{cookie}</dd>
  <dt class="font-semibold text-foreground">Profile (pretend)</dt>
  <dd class="font-mono">{profile ?? "nothing"}</dd>
  <dt class="font-semibold text-foreground">An event</dt>
  <dd>
    <Time value={start} end={start + 3 * hour} show="datetime" zone="both" />
  </dd>
</dl>

<button
  type="button"
  onclick={forget}
  class="mt-2 min-h-11 rounded-md border border-border bg-card px-4 font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
>
  Forget my choice
</button>
