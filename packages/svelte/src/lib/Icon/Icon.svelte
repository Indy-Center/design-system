<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  type Props = SVGAttributes<SVGSVGElement> & {
    /** An MDI path string, such as `mdiAirplane` from `@mdi/js`. */
    path: string;
    /** Width and height: pixels, or a CSS length. 1em (the text's size) by default. */
    size?: number | string;
    /** What the icon means, when no text beside it says so. Without one it is hidden from screen readers. */
    label?: string;
  };

  let {
    path,
    size = "1em",
    label,
    class: className,
    ...rest
  }: Props = $props();
</script>

<svg
  viewBox="0 0 24 24"
  width={size}
  height={size}
  {...rest}
  {...label ? { role: "img", "aria-label": label } : { "aria-hidden": "true" }}
  class={["inline-block shrink-0 fill-current", className]}
>
  <path d={path} />
</svg>
