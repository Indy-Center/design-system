<script lang="ts">
  import { mdiCheck } from "@mdi/js";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { choiceRowClasses } from "../formControl/formControl.js";

  type Props = Omit<HTMLInputAttributes, "type" | "role" | "children"> & {
    /** The label's text, beside the switch. */
    label: string;
    /** Whether it's on, bindable. */
    checked?: boolean;
  };

  let {
    label,
    checked = $bindable(false),
    class: className,
    ...rest
  }: Props = $props();
</script>

<!-- The label wraps the switch, so the whole 44px row flips it. -->
<label class={[choiceRowClasses, className]}>
  <span class="relative inline-flex shrink-0">
    <!-- A native checkbox drawn as the track: Space toggles it and a form
         sends it as a checkbox; `role="switch"` reads it as on or off. -->
    <input
      type="checkbox"
      role="switch"
      bind:checked
      {...rest}
      class={[
        "peer h-6 w-11 cursor-pointer appearance-none rounded-full border-2 border-input bg-muted",
        "checked:border-primary checked:bg-primary",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed",
      ]}
    />
    <!-- The thumb: left and grey when off, right and white with a tick
         when on, so the state isn't shown by colour alone. The tick is
         inside it, so they slide together; its colour is the thumb's text
         colour, clear while off. In forced colours (high contrast) the
         thumb keeps system colours of its own, so it still shows. -->
    <span
      aria-hidden="true"
      class={[
        "pointer-events-none absolute top-1 left-1 flex size-4 items-center justify-center rounded-full bg-muted-foreground text-transparent",
        "motion-safe:transition-transform",
        "peer-checked:translate-x-5 peer-checked:bg-primary-foreground peer-checked:text-primary",
        "forced-colors:bg-[CanvasText] forced-colors:forced-color-adjust-none",
        "forced-colors:peer-checked:bg-[CanvasText] forced-colors:peer-checked:text-[Canvas]",
      ]}
    >
      <svg viewBox="0 0 24 24" class="size-3 fill-current">
        <path d={mdiCheck} />
      </svg>
    </span>
  </span>
  <span>{label}</span>
</label>
