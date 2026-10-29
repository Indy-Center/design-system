<!-- The form controls' shared classes on plain elements, for
     formControl.test.ts: a text box with `textControlClasses`, or a ticked
     checkbox row with the choice classes. -->
<script lang="ts">
  import {
    choiceInputClasses,
    choiceRowClasses,
    textControlClasses,
  } from "./formControl.js";

  type Props = {
    /** Which classes to show. */
    part: "text" | "choice";
    /** Whether the text box is marked invalid. */
    invalid?: boolean;
    /** Whether the text box or checkbox is disabled. */
    disabled?: boolean;
  };

  let { part, invalid, disabled }: Props = $props();
</script>

{#if part === "text"}
  <input
    aria-label="Callsign"
    placeholder="IND_CTR"
    aria-invalid={invalid || undefined}
    {disabled}
    class={textControlClasses}
  />
{:else}
  <label class={choiceRowClasses}>
    <input type="checkbox" checked {disabled} class={choiceInputClasses} />
    <span>Visiting controller</span>
  </label>
{/if}
