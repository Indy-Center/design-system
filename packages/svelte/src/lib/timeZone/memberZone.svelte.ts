import { onMount } from "svelte";
import { getTimeZone } from "./timeZoneContext.svelte.js";

/** The zone a component shows times in, read through `memberZone()`. */
export type MemberZone = {
  /**
   * The zone local times are drawn in: the saved zone, or the device's
   * once mounted. Undefined in Zulu, and while it isn't known (on the
   * server with nothing saved).
   */
  readonly zone: string | undefined;
  /** Whether the member chose Zulu: every time in Zulu. */
  readonly zulu: boolean;
  /** Whether the component is in the browser yet. */
  readonly mounted: boolean;
};

/**
 * The member's time zone, as the root layout's `setTimeZone` saved it, for
 * every component that shows or takes a time (`Time`, `DateTimeInput`), so
 * they agree. Call it while the component is created: it reads the
 * device's zone on mount (rewriting the cookie after travel).
 */
export function memberZone(): MemberZone {
  const timeZone = getTimeZone();
  let mounted = $state(false);
  onMount(() => {
    timeZone.mount();
    mounted = true;
  });
  return {
    get zone() {
      return timeZone.zone(mounted);
    },
    get zulu() {
      return timeZone.zulu;
    },
    get mounted() {
      return mounted;
    },
  };
}
