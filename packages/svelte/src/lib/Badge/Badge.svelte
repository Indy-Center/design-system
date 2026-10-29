<script lang="ts" module>
  /** A badge's colours: the guide's Tailwind hues. */
  export const BADGE_VARIANTS = [
    "sky",
    "purple",
    "green",
    "red",
    "orange",
    "yellow",
    "blue",
    "gray",
  ] as const;

  /** A badge's colour: one of the guide's Tailwind hues. */
  export type BadgeVariant = (typeof BADGE_VARIANTS)[number];
</script>

<script lang="ts">
  import { DEV } from "esm-env";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import DecorativeIcon from "../decorativeIcon/DecorativeIcon.svelte";

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** The badge's colour. Sky by default. */
    variant?: BadgeVariant;
    /** `md` (the default) or `sm`, for tables and tight rows. */
    size?: "sm" | "md";
    /** Round ends and a stronger tint, for a status such as "Draft". */
    pill?: boolean;
    /** An icon before the text, such as `<Icon path={mdiStar} />`. Hidden from screen readers: the text says it. */
    icon?: Snippet;
    /** The badge's text. Always give one, even beside an icon. */
    children: Snippet;
  };

  let {
    variant = "sky",
    size = "md",
    pill = false,
    icon,
    children,
    class: className,
    ...rest
  }: Props = $props();

  // The guide's status-badge steps. `--hue` is the tint and border: -600 in
  // light, -500 in dark. `--ink` is the text: -800 in light, -300 in dark.
  // Tailwind's hues don't follow the scheme as roles do, hence `dark:`.
  const hues: Record<BadgeVariant, string> = {
    sky: "[--hue:var(--color-sky-600)] [--ink:var(--color-sky-800)] dark:[--hue:var(--color-sky-500)] dark:[--ink:var(--color-sky-300)]",
    purple:
      "[--hue:var(--color-purple-600)] [--ink:var(--color-purple-800)] dark:[--hue:var(--color-purple-500)] dark:[--ink:var(--color-purple-300)]",
    green:
      "[--hue:var(--color-green-600)] [--ink:var(--color-green-800)] dark:[--hue:var(--color-green-500)] dark:[--ink:var(--color-green-300)]",
    red: "[--hue:var(--color-red-600)] [--ink:var(--color-red-800)] dark:[--hue:var(--color-red-500)] dark:[--ink:var(--color-red-300)]",
    orange:
      "[--hue:var(--color-orange-600)] [--ink:var(--color-orange-800)] dark:[--hue:var(--color-orange-500)] dark:[--ink:var(--color-orange-300)]",
    yellow:
      "[--hue:var(--color-yellow-600)] [--ink:var(--color-yellow-800)] dark:[--hue:var(--color-yellow-500)] dark:[--ink:var(--color-yellow-300)]",
    blue: "[--hue:var(--color-blue-600)] [--ink:var(--color-blue-800)] dark:[--hue:var(--color-blue-500)] dark:[--ink:var(--color-blue-300)]",
    gray: "[--hue:var(--color-gray-600)] [--ink:var(--color-gray-800)] dark:[--hue:var(--color-gray-500)] dark:[--ink:var(--color-gray-300)]",
  };

  let element: HTMLSpanElement;

  // A badge is never icon-only: say so while developing.
  $effect(() => {
    if (DEV && !element.textContent?.trim()) {
      console.warn(
        "Badge has no text. Give it a word or two, even beside an icon.",
      );
    }
  });
</script>

<span
  bind:this={element}
  {...rest}
  class={[
    "inline-flex items-center gap-2 border font-medium text-(--ink)",
    size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
    pill
      ? "rounded-full border-(--hue)/50 bg-(--hue)/20"
      : "rounded-lg border-(--hue)/30 bg-(--hue)/10",
    hues[variant],
    className,
  ]}><DecorativeIcon {icon} />{@render children()}</span
>
