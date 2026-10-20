<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    /** What is progressing, shown above the bar: "Course progress". */
    label: string;
    /** How much is done, from 0 to `max`. */
    value: number;
    /** The value when it's all done. 100 by default. */
    max?: number;
    /** The value in words, such as "3 of 8 lessons". A percentage by default. */
    valueText?: string;
  };

  let {
    label,
    value,
    max = 100,
    valueText,
    class: className,
    ...rest
  }: Props = $props();

  const id = $props.id();
  const percent = $derived(
    Math.round(Math.min(Math.max(value / max, 0), 1) * 100),
  );
  const words = $derived(valueText ?? `${percent}%`);
</script>

<div {...rest} class={["flex flex-col gap-1.5", className]}>
  <div class="flex items-baseline justify-between gap-3 text-sm">
    <span id="{id}-label" class="font-medium text-foreground-soft">{label}</span
    >
    <!-- The bar says its value to readers; this is for the eye. -->
    <span aria-hidden="true" class="text-muted-foreground tabular-nums"
      >{words}</span
    >
  </div>
  <!-- A <label for> names <progress> in browsers but not in every reader,
       so the bar points at its label instead. -->
  <progress
    aria-labelledby="{id}-label"
    aria-valuetext={words}
    {value}
    {max}
    class={[
      "block h-2 w-full appearance-none overflow-hidden rounded-full border-0 bg-muted",
      "[&::-webkit-progress-bar]:bg-muted",
      "[&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-info",
      "[&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-info",
    ]}
  ></progress>
</div>
