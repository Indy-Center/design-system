<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import {
    choiceInputClasses,
    choiceRowClasses,
  } from "../formControl/formControl.js";

  type Props = Omit<HTMLInputAttributes, "type" | "children"> & {
    /** The label's text, beside the box. */
    label: string;
    /** Whether it's ticked, bindable. */
    checked?: boolean;
  };

  let {
    label,
    checked = $bindable(false),
    class: className,
    ...rest
  }: Props = $props();
</script>

<!-- The label wraps the box, so the whole 44px row ticks it. -->
<label class={[choiceRowClasses, className]}>
  <input type="checkbox" bind:checked {...rest} class={choiceInputClasses} />
  <span>{label}</span>
</label>
