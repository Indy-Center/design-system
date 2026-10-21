<script lang="ts" module>
  /** What a chip can show, each with its own colour. */
  export const CHIP_VARIANTS = [
    "muted",
    "initials",
    "senior",
    "training",
    "team",
    "certification",
    "endorsement",
    "solo",
  ] as const;

  /** What a chip shows, which sets its colour. */
  export type ChipVariant = (typeof CHIP_VARIANTS)[number];
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import DecorativeIcon from "../decorativeIcon/DecorativeIcon.svelte";

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** What the chip shows: a rating (`muted`, the default), operating initials, a staff group, or a certification, endorsement or solo. */
    variant?: ChipVariant;
    /** An icon before the code, such as `<Icon path={mdiSchool} />`. Hidden from screen readers. */
    icon?: Snippet;
    /** The short code: operating initials, a rating, a staff role. */
    children: Snippet;
  };

  let {
    variant = "muted",
    icon,
    children,
    class: className,
    ...rest
  }: Props = $props();

  // The roles have no colours for these, so they keep the community site's
  // Tailwind hues, solid and dark enough for white text on any surface.
  const fills: Record<ChipVariant, string> = {
    muted: "bg-muted text-foreground",
    initials: "bg-indigo-600 text-white",
    senior: "bg-amber-700 text-white",
    training: "bg-rose-700 text-white",
    team: "bg-slate-600 text-white",
    certification: "bg-emerald-700 text-white",
    // Credential's other kinds: tints of roles, so they follow the scheme.
    // Text in the role would fall short of 4.5:1 on its tint in light.
    endorsement: "bg-info/20 text-foreground",
    solo: "bg-warning/20 text-foreground",
  };
</script>

<span
  {...rest}
  class={[
    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-semibold",
    fills[variant],
    className,
  ]}><DecorativeIcon {icon} />{@render children()}</span
>
