<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { control } from "./control.js";

  type Props = Omit<HTMLInputAttributes, "type"> & {
    /** One of the types the apps use; "text" when left out. */
    type?:
      "text" | "search" | "url" | "number" | "date" | "time" | "datetime-local";
    /** The value, bindable. */
    value?: HTMLInputAttributes["value"];
  };

  let {
    type = "text",
    value = $bindable(),
    class: className,
    ...rest
  }: Props = $props();
</script>

<input {type} bind:value {...rest} class={[control, className]} />
