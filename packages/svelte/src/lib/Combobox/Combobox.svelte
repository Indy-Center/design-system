<script lang="ts" generics="T">
  import { mdiChevronDown } from "@mdi/js";
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { dismiss } from "../dismiss/dismiss.js";
  import { textControlClasses } from "../formControl/formControl.js";
  import Icon from "../Icon/Icon.svelte";

  type Props = Omit<
    HTMLInputAttributes,
    "type" | "value" | "role" | "name" | "children"
  > & {
    /** The options: a list, or a function that searches for the typed text. */
    options: T[] | ((query: string) => T[] | Promise<T[]>);
    /** The option picked, or null; bindable. */
    value?: T | null;
    /** Sends the picked option's key with a form under this name. */
    name?: string;
    /** An option's text: shown in the box once picked, and matched against. */
    getText?: (option: T) => string;
    /** An option's key: unique, and sent with the form. */
    getKey?: (option: T) => string;
    /** Draws an option in the list; its text when left out. */
    option?: Snippet<[T]>;
  };

  let {
    options,
    value = $bindable(null),
    name,
    getText = String,
    getKey = getText,
    option,
    id,
    class: className,
    // The caller's own handlers, run before the combobox's.
    oninput: callerInput,
    onkeydown: callerKeydown,
    onclick: callerClick,
    onblur: callerBlur,
    ...rest
  }: Props = $props();

  const madeId = $props.id();
  const inputId = $derived(id ?? madeId);
  const listId = $derived(`${inputId}-listbox`);

  let open = $state(false);
  // The text in the box.
  let query = $state("");
  // The option with visual focus, as an index into `results`; -1 for none.
  let active = $state(-1);
  // "Ann Archer, selected": the last pick, said once the list closes.
  let pickedMessage = $state("");

  // What a search function last found, whether it is still looking, and
  // whether its last search failed.
  let found = $state<T[]>([]);
  let searching = $state(false);
  let failed = $state(false);

  const results = $derived.by(() => {
    if (!Array.isArray(options)) return found;
    const q = query.trim().toLowerCase();
    return options.filter((o) => getText(o).toLowerCase().includes(q));
  });

  // Asks a search function for each new text while the list is open.
  $effect(() => {
    if (Array.isArray(options) || !open) return;
    let current = true;
    searching = true;
    const search = options;
    // A function that throws fails the same way as one that rejects.
    new Promise<T[]>((resolve) => resolve(search(query))).then(
      (answer) => settle(answer, false),
      () => settle([], true),
    );
    function settle(answer: T[], error: boolean) {
      // A newer text has been typed since; its answer is the one to show.
      if (!current) return;
      found = answer;
      failed = error;
      searching = false;
      active = -1;
    }
    return () => {
      current = false;
    };
  });

  // What the status region says to screen readers: how many match while
  // the list is open, then what was picked.
  const announcement = $derived.by(() => {
    if (!open) return pickedMessage;
    if (searching) return "";
    if (failed) return "Couldn't search";
    const count = results.length;
    if (count === 0) return "No results";
    return count === 1 ? "1 result" : `${count} results`;
  });

  const optionId = (index: number) => `${inputId}-option-${index}`;

  // Keeps the active option in view as the arrows move through a long list.
  $effect(() => {
    if (active < 0) return;
    document.getElementById(optionId(active))?.scrollIntoView({
      block: "nearest",
    });
  });

  let input = $state<HTMLInputElement>();

  const keyOf = (option: T | null) => (option == null ? null : getKey(option));

  // The key of the pick the box's text was last written from. When `value`
  // changes from outside (a form reset), the box follows it. Keys, not the
  // options, are compared: a bound value comes back as a proxy.
  let shownKey: string | null = null;
  $effect.pre(() => {
    const key = keyOf(value);
    if (key === shownKey) return;
    shownKey = key;
    query = value == null ? "" : getText(value);
  });

  // The form sends the hidden input, so the box's own `required` only
  // checks for text. Text with no pick fails the form's check too.
  $effect(() => {
    const unpicked = rest.required && value == null && query !== "";
    input?.setCustomValidity(unpicked ? "Pick an option from the list." : "");
  });

  /** Sets the pick, leaving the box's text as it is. */
  function pick(next: T | null) {
    shownKey = keyOf(next);
    value = next;
  }

  function oninput() {
    // Changing the text undoes the pick, so a form never sends a pick the
    // box no longer shows.
    pick(null);
    pickedMessage = "";
    active = -1;
    open = true;
  }

  function show() {
    if (open) return;
    // Reopening isn't a new pick: don't say the old one again on close.
    pickedMessage = "";
    open = true;
  }

  /** Moves visual focus by `step` options, wrapping round the ends. */
  function move(step: 1 | -1) {
    const count = results.length;
    const wasOpen = open;
    show();
    if (count === 0) return;
    if (!wasOpen || active < 0) {
      active = step === 1 ? 0 : count - 1;
    } else {
      active = (active + step + count) % count;
    }
  }

  function close() {
    open = false;
    active = -1;
  }

  function choose(option: T) {
    pick(option);
    query = getText(option);
    pickedMessage = `${query}, selected`;
    close();
  }

  function onlistclick(event: MouseEvent & { currentTarget: HTMLElement }) {
    const row = (event.target as Element).closest("[role=option]");
    const index = row ? [...event.currentTarget.children].indexOf(row) : -1;
    if (index >= 0) choose(results[index]);
  }

  function onkeydown(event: KeyboardEvent) {
    // A caller's handler that prevents a key keeps it from the combobox.
    if (event.isComposing || event.defaultPrevented) return;
    switch (event.key) {
      case "Enter":
        if (!open) break;
        // While the list is open, Enter is the list's, not the form's.
        event.preventDefault();
        if (active >= 0) choose(results[active]);
        else close();
        break;
      case "Home":
      case "End":
      case "ArrowLeft":
      case "ArrowRight":
        // The browser moves the caret; visual focus goes back to the box.
        active = -1;
        break;
      case "Escape":
        // An open list is closed by `dismiss`; a closed one clears the box.
        if (open) break;
        event.preventDefault();
        pick(null);
        query = "";
        break;
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
    }
  }
</script>

<div class={["relative", className]}>
  {#if name}
    <input type="hidden" {name} value={keyOf(value) ?? ""} />
  {/if}
  <input
    {...rest}
    id={inputId}
    type="text"
    role="combobox"
    autocomplete="off"
    aria-autocomplete="list"
    aria-expanded={open}
    aria-controls={listId}
    aria-activedescendant={active >= 0 ? optionId(active) : undefined}
    bind:this={input}
    bind:value={query}
    oninput={(event) => {
      callerInput?.(event);
      oninput();
    }}
    onclick={(event) => {
      callerClick?.(event);
      show();
    }}
    onblur={(event) => {
      callerBlur?.(event);
      close();
    }}
    onkeydown={(event) => {
      callerKeydown?.(event);
      onkeydown(event);
    }}
    class={[textControlClasses, "pr-10"]}
  />
  <Icon
    path={mdiChevronDown}
    class={[
      "pointer-events-none absolute top-3 right-3 size-5 text-muted-foreground",
      open && "rotate-180",
    ]}
  />
  <div
    hidden={!open}
    use:dismiss={{ open, trigger: input, onclose: close }}
    class="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
  >
    <!-- Focus stays in the box, which takes the keys (the WAI pattern), so
         the list has no key handler; a press here mustn't take focus away. -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <ul
      id={listId}
      role="listbox"
      class="max-h-64 overflow-y-auto empty:hidden"
      onmousedown={(event) => event.preventDefault()}
      onclick={onlistclick}
    >
      {#each results as result, index (getKey(result))}
        <li
          id={optionId(index)}
          role="option"
          aria-selected={index === active}
          class={[
            "flex min-h-11 cursor-pointer items-center gap-2 px-3 py-2 text-foreground hover:bg-muted",
            "aria-selected:bg-muted aria-selected:outline-2 aria-selected:-outline-offset-2 aria-selected:outline-ring",
          ]}
        >
          {#if option}{@render option(result)}{:else}{getText(result)}{/if}
        </li>
      {/each}
    </ul>
    {#if searching}
      <p class="px-3 py-2 text-muted-foreground">Searching…</p>
    {:else if failed}
      <p class="px-3 py-2 text-muted-foreground">Couldn't search</p>
    {:else if results.length === 0}
      <p class="px-3 py-2 text-muted-foreground">No matches</p>
    {/if}
  </div>
  <div role="status" class="sr-only">{announcement}</div>
</div>
