<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { getFieldset } from "../Fieldset/fieldsetContext.js";
  import Description from "../formControl/Description.svelte";
  import {
    choiceInputClasses,
    choiceRowClasses,
    describedBy,
  } from "../formControl/formControl.js";

  type Props = Omit<HTMLInputAttributes, "type" | "children"> & {
    /** The label's text, beside the box. */
    label: string;
    /** Whether it's ticked, bindable. */
    checked?: boolean;
    /** What's wrong, for a box on its own (in a Fieldset, use its `error`). */
    error?: string;
  };

  let {
    label,
    checked = $bindable(false),
    error,
    "aria-describedby": callersDescribedBy,
    class: className,
    ...rest
  }: Props = $props();

  const id = $props.id();
  const fieldset = getFieldset();
</script>

<div class={["flex flex-col", className]}>
  <!-- The label wraps the box, so the whole 44px row ticks it. -->
  <label class={choiceRowClasses}>
    <input
      type="checkbox"
      bind:checked
      aria-invalid={error || fieldset?.invalid ? true : undefined}
      {...rest}
      aria-describedby={describedBy(id, { error }, callersDescribedBy)}
      class={choiceInputClasses}
    />
    <span>{label}</span>
  </label>
  {#if error}
    <!-- Under the label's text, past the box. -->
    <div class="pl-8">
      <Description {id} {error} />
    </div>
  {/if}
</div>
