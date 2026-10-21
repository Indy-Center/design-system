<script lang="ts">
  import type { HTMLFieldsetAttributes } from "svelte/elements";
  import Fieldset from "../Fieldset/Fieldset.svelte";
  import Icon from "../Icon/Icon.svelte";
  import type { DescriptionProps } from "../formControl/formControl.js";
  import { STARS, starLabel, starLook, starsInWords } from "./stars.js";

  type Props = Omit<HTMLFieldsetAttributes, "children"> &
    DescriptionProps & {
      /** The legend's text, which asks the question ("How was your session?"). */
      legend: string;
      /** The radios' name, sent with the form. */
      name: string;
      /** The stars chosen, 1 to 5, bindable; `undefined` while none are. */
      value?: number;
      /** Says "(required)" by the legend; the form won't send with none chosen. */
      required?: boolean;
    };

  let {
    legend,
    name,
    value = $bindable(),
    required = false,
    disabled,
    ...rest
  }: Props = $props();

  // The star the pointer is over: the stars up to it light as a preview.
  let hovered = $state<number>();
  const shown = $derived((disabled ? undefined : hovered) ?? value ?? 0);
</script>

<Fieldset {legend} {required} {disabled} {...rest}>
  <div class="flex flex-wrap items-center gap-x-3">
    <div
      class="flex"
      role="presentation"
      onmouseleave={() => (hovered = undefined)}
    >
      {#each STARS as star (star)}
        {@const look = starLook(star, shown)}
        <!-- The label is the 44px target; the radio inside it is hidden
             but focusable, and its focus rings the label. -->
        <label
          class={[
            "grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-lg",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
            "has-disabled:cursor-not-allowed has-disabled:opacity-60",
            look.colour,
          ]}
          onmouseenter={() => (hovered = star)}
        >
          <input
            type="radio"
            {name}
            value={star}
            bind:group={value}
            {required}
            class="sr-only"
          />
          <span class="sr-only">{starLabel(star)}</span>
          <Icon path={look.path} size={32} />
        </label>
      {/each}
    </div>
    <!-- The checked radio already says how many; this is for the eye. -->
    <span class="text-sm text-muted-foreground" aria-hidden="true">
      {shown ? starsInWords(shown) : "Not rated"}
    </span>
  </div>
</Fieldset>
