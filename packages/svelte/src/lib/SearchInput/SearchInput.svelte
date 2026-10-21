<script lang="ts">
  import { mdiMagnify } from "@mdi/js";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { textControlClasses } from "../formControl/formControl.js";
  import Icon from "../Icon/Icon.svelte";

  type Props = Omit<HTMLInputAttributes, "type" | "children"> & {
    /** What is searched, such as "Search the roster". Always given: it names the box. */
    label: string;
    /** Hides the label from sight but not from screen readers, where the bar makes it plain. */
    hideLabel?: boolean;
    /** The search text, bindable. */
    value?: string;
  };

  let {
    label,
    hideLabel = false,
    value = $bindable(""),
    id,
    class: className,
    ...rest
  }: Props = $props();

  const madeId = $props.id();
  const inputId = $derived(id ?? madeId);
</script>

<div class={["flex flex-col gap-1.5", className]}>
  <label
    for={inputId}
    class={hideLabel ? "sr-only" : "text-sm font-medium text-foreground-soft"}
    >{label}</label
  >
  <div class="relative">
    <!-- After the box, so a parent's `space-*` and the label's gap ignore it. -->
    <input
      {...rest}
      id={inputId}
      type="search"
      bind:value
      class={[textControlClasses, "pl-10"]}
    />
    <Icon
      path={mdiMagnify}
      class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
    />
  </div>
</div>
