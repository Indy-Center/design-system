<script lang="ts" module>
  /** A badge's colour: one of the guide's Tailwind hues. */
  export type BadgeColor =
    "sky" | "purple" | "green" | "red" | "orange" | "yellow" | "blue" | "gray";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** The badge's colour. Sky by default. */
    color?: BadgeColor;
    /** `md` (the default) or `sm`, for tables and tight rows. */
    size?: "sm" | "md";
    /** Round ends, for a status such as "Draft" or "In progress". */
    pill?: boolean;
    /** An icon before the text, such as `<Icon path={mdiStar} />`. Hidden from screen readers: the text says it. */
    icon?: Snippet;
    /** The badge's text. Always give one, even beside an icon. */
    children: Snippet;
  };

  let {
    color = "sky",
    size = "md",
    pill = false,
    icon,
    children,
    class: className,
    ...rest
  }: Props = $props();

  // The guide's status-badge steps (decision 0004): in light, a 10% tint of
  // -600 with -800 text; in dark, a 10% tint of -500 with -300 text. Stock
  // colours don't follow the scheme as roles do, so these use `dark:`.
  const colors: Record<BadgeColor, string> = {
    sky: "border-sky-600/30 bg-sky-600/10 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
    purple:
      "border-purple-600/30 bg-purple-600/10 text-purple-800 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300",
    green:
      "border-green-600/30 bg-green-600/10 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300",
    red: "border-red-600/30 bg-red-600/10 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
    orange:
      "border-orange-600/30 bg-orange-600/10 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
    yellow:
      "border-yellow-600/30 bg-yellow-600/10 text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300",
    blue: "border-blue-600/30 bg-blue-600/10 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
    gray: "border-gray-600/30 bg-gray-600/10 text-gray-800 dark:border-gray-500/30 dark:bg-gray-500/10 dark:text-gray-300",
  };
</script>

<span
  {...rest}
  class={[
    "inline-flex items-center gap-2 border font-medium",
    size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
    pill ? "rounded-full" : "rounded-lg",
    colors[color],
    className,
  ]}
  >{#if icon}<span aria-hidden="true" class="inline-flex">{@render icon()}</span
    >{/if}{@render children()}</span
>
