// What a Fieldset tells the Checkboxes and Radios inside it. Plain
// get/setContext, not `createContext`, which needs Svelte 5.40.
import { getContext, setContext } from "svelte";

export type FieldsetContext = {
  /** The group has an error: checkboxes take `aria-invalid`. */
  readonly invalid: boolean;
  /** The group is required: radios take `required`. */
  readonly required: boolean;
};

const key = Symbol("Fieldset");

export function setFieldset(context: FieldsetContext) {
  setContext(key, context);
}

/** The nearest Fieldset's context, or `undefined` outside one. */
export function getFieldset(): FieldsetContext | undefined {
  return getContext(key);
}
