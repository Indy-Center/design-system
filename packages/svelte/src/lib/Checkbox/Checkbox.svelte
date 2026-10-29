<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { getFieldset } from "../Fieldset/fieldsetContext.js";
  import ChoiceText from "../formControl/ChoiceText.svelte";
  import Description from "../formControl/Description.svelte";
  import {
    choiceInputClasses,
    choiceInputWithChildrenClasses,
    choiceLabelId,
    choiceRowClasses,
    choiceRowWithChildrenClasses,
    describedBy,
  } from "../formControl/formControl.js";

  type Props = Omit<HTMLInputAttributes, "type" | "children"> & {
    /** The label's text, beside the box. */
    label: string;
    /** Whether it's ticked, bindable. */
    checked?: boolean;
    /** What's wrong, for a box on its own (in a Fieldset, use its `error`). */
    error?: string;
    /** More about the option, under the label, read as its description. */
    children?: Snippet;
  };

  let {
    label,
    checked = $bindable(false),
    error,
    children,
    "aria-describedby": callersDescribedBy,
    class: className,
    ...rest
  }: Props = $props();

  const id = $props.id();
  const fieldset = getFieldset();
</script>

<div class={["flex flex-col", className]}>
  <!-- The label wraps the box, so the whole 44px row ticks it. -->
  <label class={[choiceRowClasses, children && choiceRowWithChildrenClasses]}>
    <input
      type="checkbox"
      bind:checked
      aria-invalid={error || fieldset?.invalid ? true : undefined}
      aria-labelledby={children ? choiceLabelId(id) : undefined}
      {...rest}
      aria-describedby={describedBy(
        id,
        { hint: children, error },
        callersDescribedBy,
      )}
      class={[choiceInputClasses, children && choiceInputWithChildrenClasses]}
    />
    <ChoiceText {id} {label} {children} />
  </label>
  {#if error}
    <!-- Under the label's text, past the box. -->
    <div class="pl-8">
      <Description {id} {error} />
    </div>
  {/if}
</div>
