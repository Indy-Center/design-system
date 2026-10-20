<script lang="ts" module>
  /** What a chip shows, which sets its colour. */
  export type ChipTone = "muted" | "initials" | "senior" | "training" | "team";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** What the chip shows: a rating (`muted`, the default), operating initials, or a staff group. */
    tone?: ChipTone;
    /** An icon before the code, such as `<Icon path={mdiSchool} />`. Hidden from screen readers. */
    icon?: Snippet;
    /** The short code: operating initials, a rating, a staff role. */
    children: Snippet;
  };

  let {
    tone = "muted",
    icon,
    children,
    class: className,
    ...rest
  }: Props = $props();

  // The roles have no colours for initials or staff groups, so these keep
  // the community site's Tailwind hues (decision 0004, as for Badge). White
  // on solid fills, so the text passes 4.5:1 on any surface in either
  // scheme; the site's see-through `-600/80` fills fell short on light pages.
  const tones: Record<ChipTone, string> = {
    muted: "bg-muted text-foreground",
    initials: "bg-indigo-600 text-white",
    senior: "bg-amber-700 text-white",
    training: "bg-rose-700 text-white",
    team: "bg-slate-600 text-white",
  };
</script>

<span
  {...rest}
  class={[
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-semibold",
    tones[tone],
    className,
  ]}
  >{#if icon}<span aria-hidden="true" class="inline-flex">{@render icon()}</span
    >{/if}{@render children()}</span
>
