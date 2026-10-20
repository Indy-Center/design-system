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
  import ErrorIcon from "../formControl/ErrorIcon.svelte";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "id" | "children"> & {
    /** The label's text. */
    label: string;
    /** A line on what to enter, under the control. */
    hint?: string;
    /** What's wrong with the value; marks the control invalid when set. */
    error?: string;
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
  const hintId = $derived(`${controlId}-hint`);
  const errorId = $derived(`${controlId}-error`);

  const control: FieldControl = $derived({
    id: controlId,
    "aria-describedby":
      [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined,
    "aria-invalid": error ? true : undefined,
    required: required || undefined,
  });
</script>

<div {...rest} class={["flex flex-col gap-1.5", className]}>
  <label for={controlId} class="text-sm font-medium text-foreground-soft">
    {label}
    {#if required}
      <!-- The control's own `required` says it to screen readers. -->
      <span aria-hidden="true" class="font-normal text-muted-foreground"
        >(required)</span
      >
    {/if}
  </label>
  {@render children(control)}
  {#if hint}
    <p id={hintId} class="text-sm text-muted-foreground">{hint}</p>
  {/if}
  {#if error}
    <p id={errorId} class="flex gap-1.5 text-sm text-destructive">
      <ErrorIcon />
      <span>{error}</span>
    </p>
  {/if}
</div>
