<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";
  import Description from "../formControl/Description.svelte";
  import RequiredMark from "../formControl/RequiredMark.svelte";
  import {
    describedBy,
    type DescriptionProps,
  } from "../formControl/formControl.js";
  import { setFieldset } from "./fieldsetContext.js";

  type Props = Omit<HTMLFieldsetAttributes, "children"> &
    DescriptionProps & {
      /** The legend's text, which names the group. */
      legend: string;
      /** Says "(required)" by the legend, and makes each radio in it required. */
      required?: boolean;
      /** The options: `Radio`s or `Checkbox`es. */
      children: Snippet;
    };

  let {
    legend,
    hint,
    error,
    required = false,
    children,
    "aria-describedby": callersDescribedBy,
    class: className,
    ...rest
  }: Props = $props();

  const id = $props.id();

  setFieldset({
    get invalid() {
      return Boolean(error);
    },
    get required() {
      return required;
    },
  });
</script>

<fieldset
  {...rest}
  aria-describedby={describedBy(id, { hint, error }, callersDescribedBy)}
  class={["flex flex-col gap-1.5", className]}
>
  <legend class="mb-1.5 text-sm font-medium text-foreground-soft">
    {legend}
    {#if required}
      <!-- Read with the legend: a checkbox group has no other way to say it. -->
      <RequiredMark announced />
    {/if}
  </legend>
  <div class="flex flex-col">
    {@render children()}
  </div>
  <Description {id} {hint} {error} />
</fieldset>
