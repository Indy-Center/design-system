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
    /** The short code: operating initials, a rating, a staff role. */
    children: Snippet;
  };

  let { tone = "muted", children, class: className, ...rest }: Props = $props();

  // White on solid fills, so the text passes 4.5:1 on any surface. The
  // community site's see-through `-600/80` fills fell short on light pages.
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
  ]}>{@render children()}</span
>
