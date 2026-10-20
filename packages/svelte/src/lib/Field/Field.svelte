<script lang="ts" module>
  /** What Field hands its control, to spread on it: `<Input {...control} />`. */
  export type FieldControl = {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": true | undefined;
    required: true | undefined;
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Description from "../formControl/Description.svelte";
  import RequiredMark from "../formControl/RequiredMark.svelte";
  import {
    describedBy,
    type DescriptionProps,
  } from "../formControl/formControl.js";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "id" | "children"> &
    DescriptionProps & {
      /** The label's text. */
      label: string;
      /** Says "(required)" by the label and makes the control required. */
      required?: boolean;
      /** The control's id; one is made when left out. */
      id?: string;
      /** The control, given the attributes to spread on it. */
      children: Snippet<[FieldControl]>;
    };

  let {
    label,
    hint,
    error,
    required = false,
    id,
    children,
    class: className,
    ...rest
  }: Props = $props();

  const madeId = $props.id();
  const controlId = $derived(id ?? madeId);

  const control: FieldControl = $derived({
    id: controlId,
    "aria-describedby": describedBy(controlId, { hint, error }),
    "aria-invalid": error ? true : undefined,
    required: required || undefined,
  });
</script>

<div {...rest} class={["flex flex-col gap-1.5", className]}>
  <label for={controlId} class="text-sm font-medium text-foreground-soft">
    {label}
    {#if required}
      <!-- The control's own `required` says it to screen readers. -->
      <RequiredMark announced={false} />
    {/if}
  </label>
  {@render children(control)}
  <Description id={controlId} {hint} {error} />
</div>
