<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { getFieldset } from "../Fieldset/fieldsetContext.js";
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
    required,
    onchange,
    class: className,
    ...rest
  }: Props = $props();

  const fieldset = getFieldset();
</script>

<!-- The label wraps the circle, so the whole 44px row chooses it. `group`
     is kept by hand, not with Svelte's `bind:group`, which only links
     inputs inside one component, not radios in sibling components. -->
<label class={[choiceRowClasses, className]}>
  <input
    type="radio"
    {name}
    {value}
    checked={group === value}
    required={required ?? fieldset?.required}
    onchange={(event) => {
      group = value;
      onchange?.(event);
    }}
    {...rest}
    class={choiceInputClasses}
  />
  <span>{label}</span>
</label>
