<script lang="ts" generics="T extends string | number">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { getFieldset } from "../Fieldset/fieldsetContext.js";
  import ChoiceText from "../formControl/ChoiceText.svelte";
  import {
    choiceInputClasses,
    choiceInputWithChildrenClasses,
    choiceLabelId,
    choiceRowClasses,
    choiceRowWithChildrenClasses,
    describedBy,
  } from "../formControl/formControl.js";

  type Props = Omit<
    HTMLInputAttributes,
    "type" | "children" | "name" | "value" | "checked"
  > & {
    /** The label's text, beside the circle. */
    label: string;
    /** The group's name, the same on every radio in it: the arrow keys move within it. */
    name: string;
    /** This radio's value: a string or a number, sent as text with the form. */
    value: T;
    /** The chosen radio's value, bindable: `bind:group` on every radio in the group. */
    group?: T;
    /** More about the option, under the label, read as its description. */
    children?: Snippet;
  };

  let {
    label,
    name,
    value,
    group = $bindable(),
    required,
    onchange,
    children,
    "aria-describedby": callersDescribedBy,
    class: className,
    ...rest
  }: Props = $props();

  const id = $props.id();
  const fieldset = getFieldset();

  let input: HTMLInputElement;

  // Choosing a radio unchecks the rest of its group without an event. When
  // `group` isn't bound, each radio holds its own copy, and one still saying
  // "me" would ignore the parent later setting it to this value again. So a
  // sibling's change clears that copy. Bound, the shared value has already
  // moved on, so this does nothing.
  function onSiblingChange(event: Event) {
    const other = event.target;
    if (
      group === value &&
      other !== input &&
      other instanceof HTMLInputElement &&
      other.type === "radio" &&
      other.name === name &&
      other.form === input.form
    ) {
      group = undefined;
    }
  }
</script>

<svelte:document onchange={onSiblingChange} />

<!-- The label wraps the circle, so the whole 44px row chooses it. `group`
     is kept by hand, not with Svelte's `bind:group`, which only links
     inputs inside one component, not radios in sibling components. -->
<label
  class={[
    choiceRowClasses,
    children && choiceRowWithChildrenClasses,
    className,
  ]}
>
  <input
    bind:this={input}
    type="radio"
    {name}
    {value}
    checked={group === value}
    required={required ?? fieldset?.required}
    onchange={(event) => {
      group = value;
      onchange?.(event);
    }}
    aria-labelledby={children ? choiceLabelId(id) : undefined}
    {...rest}
    aria-describedby={describedBy(id, { hint: children }, callersDescribedBy)}
    class={[choiceInputClasses, children && choiceInputWithChildrenClasses]}
  />
  <ChoiceText {id} {label} {children} />
</label>
