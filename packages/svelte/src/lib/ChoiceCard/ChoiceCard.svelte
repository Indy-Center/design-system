<script lang="ts" generics="T extends string | number">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import Checkbox from "../Checkbox/Checkbox.svelte";
  import Radio from "../Radio/Radio.svelte";

  type Shared = Omit<
    HTMLInputAttributes,
    "type" | "children" | "name" | "value" | "checked"
  > & {
    /** The option's name, in the card's first line. */
    label: string;
    /** More about the option, under the label, read as its description. */
    children?: Snippet;
  };

  type Props = Shared &
    (
      | {
          /** One of several: a `Radio` inside. */
          type: "radio";
          /** The group's name, the same on every card in it. */
          name: string;
          /** This card's value. */
          value: T;
          /** The chosen card's value, bindable: `bind:group` on every card. */
          group?: T;
          /** Not for radios: use `group`. */
          checked?: never;
        }
      | {
          /** Any number: a `Checkbox` inside. */
          type: "checkbox";
          /** The form field's name. */
          name?: string;
          /** What the form sends when it's ticked; `on` when left out. */
          value?: string;
          /** Whether it's ticked, bindable. */
          checked?: boolean;
          /** Not for checkboxes: use `checked`. */
          group?: never;
        }
    );

  let {
    type,
    label,
    name,
    value,
    group = $bindable(),
    checked = $bindable(false),
    children,
    class: className,
    ...rest
  }: Props = $props();
</script>

<!-- The card is the outer box. The Radio's or Checkbox's label fills it,
     padding and all, so a click anywhere on the card picks it, and the
     card highlights itself while its input is checked. -->
<div
  class={[
    "rounded-lg border border-border not-has-checked:hover:border-input",
    "has-checked:border-primary has-checked:bg-primary/10",
    "motion-safe:transition-colors",
    // Disabled, the whole card dims, its edge too, and the label inside
    // doesn't dim a second time.
    "has-disabled:opacity-60 [&_label]:has-disabled:opacity-100",
    // Stacked in a Fieldset, cards keep apart, as training's did.
    "not-last:mb-3",
    "[&_label]:px-4 [&_label]:py-3",
    className,
  ]}
>
  {#if type === "radio"}
    <Radio
      {label}
      name={name!}
      value={value as T}
      bind:group
      {children}
      {...rest}
    />
  {:else}
    <Checkbox
      {label}
      {name}
      value={value as string | undefined}
      bind:checked
      {children}
      {...rest}
    />
  {/if}
</div>
