<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";
  import ErrorIcon from "../formControl/ErrorIcon.svelte";

  type Props = Omit<HTMLFieldsetAttributes, "children"> & {
    /** The legend's text, which names the group. */
    legend: string;
    /** A line on how to choose, under the options. */
    hint?: string;
    /** What's wrong with the choice. */
    error?: string;
    /** Says "(required)" by the legend; for radios, put `required` on each so the browser checks it. */
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
    class: className,
    ...rest
  }: Props = $props();

  const id = $props.id();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
</script>

<fieldset
  aria-describedby={[hint && hintId, error && errorId]
    .filter(Boolean)
    .join(" ") || undefined}
  {...rest}
  class={["flex flex-col gap-1.5", className]}
>
  <legend class="mb-1.5 text-sm font-medium text-foreground-soft">
    {legend}
    {#if required}
      <!-- Read with the legend: a checkbox group has no other way to say it. -->
      <span class="font-normal text-muted-foreground">(required)</span>
    {/if}
  </legend>
  <div class="flex flex-col">
    {@render children()}
  </div>
  {#if hint}
    <p id={hintId} class="text-sm text-muted-foreground">{hint}</p>
  {/if}
  {#if error}
    <p id={errorId} class="flex gap-1.5 text-sm text-destructive">
      <ErrorIcon />
      <span>{error}</span>
    </p>
  {/if}
</fieldset>
