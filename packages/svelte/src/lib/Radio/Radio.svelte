<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import {
    choiceInputClasses,
    choiceRowClasses,
  } from "../formControl/formControl.js";

  type Props = Omit<
    HTMLInputAttributes,
    "type" | "children" | "name" | "value" | "checked"
  > & {
    /** The label's text, beside the circle. */
    label: string;
    /** The group's name, the same on every radio in it: the arrow keys move within it. */
    name: string;
    /** This radio's value. */
    value: string;
    /** The chosen radio's value, bindable: `bind:group` on every radio in the group. */
    group?: string;
  };

  let {
    label,
    name,
    value,
    group = $bindable(),
    onchange,
    class: className,
    ...rest
  }: Props = $props();
</script>

<!-- The label wraps the circle, so the whole 44px row chooses it. -->
<label class={[choiceRowClasses, className]}>
  <input
    type="radio"
    {name}
    {value}
    checked={group === value}
    onchange={(event) => {
      group = value;
      onchange?.(event);
    }}
    {...rest}
    class={choiceInputClasses}
  />
  <span>{label}</span>
</label>
