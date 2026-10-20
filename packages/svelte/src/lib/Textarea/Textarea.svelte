<script lang="ts">
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import { formControlClasses } from "../formControl/formControl.js";

  type Props = HTMLTextareaAttributes & {
    /** The text, bindable. */
    value?: HTMLTextareaAttributes["value"];
  };

  let { value = $bindable(), class: className, ...rest }: Props = $props();
</script>

<textarea bind:value {...rest} class={[formControlClasses, className]}
></textarea>
