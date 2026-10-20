<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLSelectAttributes } from "svelte/elements";
  import { formControlClasses } from "../formControl/formControl.js";

  type Props = HTMLSelectAttributes & {
    /** The chosen option's value, bindable. */
    value?: HTMLSelectAttributes["value"];
    /** The `<option>` and `<optgroup>` elements. */
    children: Snippet;
  };

  let {
    value = $bindable(),
    children,
    class: className,
    ...rest
  }: Props = $props();
</script>

<select bind:value {...rest} class={[formControlClasses, className]}>
  {@render children()}
</select>
