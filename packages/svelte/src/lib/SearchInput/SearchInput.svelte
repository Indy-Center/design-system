<script lang="ts">
  import { mdiClose, mdiMagnify } from "@mdi/js";
  import type { HTMLInputAttributes } from "svelte/elements";
  import Field from "../Field/Field.svelte";
  import { textControlClasses } from "../formControl/formControl.js";
  import Icon from "../Icon/Icon.svelte";

  type Props = Omit<HTMLInputAttributes, "type" | "children"> & {
    /** What is searched, such as "Search the roster". Always given: it names the box. */
    label: string;
    /** Hides the label from sight but not from screen readers, where the bar makes it plain. */
    hideLabel?: boolean;
    /** The search text, bindable. */
    value?: string;
  };

  let {
    label,
    hideLabel = false,
    value = $bindable(""),
    id,
    disabled,
    readonly,
    onkeydown,
    class: className,
    ...rest
  }: Props = $props();

  let input: HTMLInputElement | undefined = $state();
  const clearable = $derived(!!value && !disabled && !readonly);

  // Empties the box with an input event, as the browser's own clear does,
  // so `bind:value` and a caller's `oninput` both hear it.
  function clear() {
    input!.value = "";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
  }
</script>

<Field {label} {hideLabel} id={id ?? undefined} class={className}>
  {#snippet children(control)}
    <div class="relative">
      <!-- The browser's own clear button is hidden: Firefox has none, so
           the box draws one for every browser. -->
      <input
        {...control}
        {...rest}
        bind:this={input}
        type="search"
        {disabled}
        {readonly}
        bind:value
        onkeydown={(event) => {
          onkeydown?.(event);
          // Escape clears the box in every browser, not only Chromium's.
          // Only when there is text, so an empty box lets Escape close a
          // dialog or menu around it.
          if (event.key !== "Escape" || event.defaultPrevented || !clearable)
            return;
          event.preventDefault();
          event.stopPropagation();
          clear();
        }}
        class={[
          textControlClasses,
          "pr-11 pl-10 [&::-webkit-search-cancel-button]:appearance-none",
        ]}
      />
      <Icon
        path={mdiMagnify}
        class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
      />
      {#if clearable}
        <button
          type="button"
          aria-label="Clear the search"
          onclick={() => {
            clear();
            input!.focus();
          }}
          class="absolute top-1/2 right-0 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Icon path={mdiClose} class="size-5" />
        </button>
      {/if}
    </div>
  {/snippet}
</Field>
