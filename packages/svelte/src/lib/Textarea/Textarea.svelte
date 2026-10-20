<script lang="ts">
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import { control } from "../Input/control.js";

  type Props = HTMLTextareaAttributes & {
    /** The text, bindable. */
    value?: HTMLTextareaAttributes["value"];
  };

  let { value = $bindable(), class: className, ...rest }: Props = $props();
</script>

<textarea bind:value {...rest} class={[control, className]}></textarea>
