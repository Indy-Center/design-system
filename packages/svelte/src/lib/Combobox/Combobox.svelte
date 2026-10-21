<script lang="ts" generics="T">
  import { mdiChevronDown } from "@mdi/js";
  import { untrack, type Snippet } from "svelte";
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

  // What a search function last found, the text it found it for, whether
  // it is still looking, and whether its last search failed.
  let found = $state<T[]>([]);
  let foundFor = $state<string | null>(null);
  let searching = $state(false);
  let failed = $state(false);
  // The arrow that opened the list before the search's answer came: 1 for
  // Down, -1 for Up, 0 for none. Once the answer is in, it lands on the
  // first or last option.
  let opening: 1 | -1 | 0 = 0;

  // The list shown answers older text than the box's, while a search for
  // the new text is under way. Its options no longer match, so the arrows
  // don't move into it, and Enter, with no active option, can't pick one.
  const stale = $derived(!Array.isArray(options) && foundFor !== query);

  const results = $derived.by(() => {
    if (!Array.isArray(options)) return found;
    const q = query.trim().toLowerCase();
    return options.filter((o) => getText(o).toLowerCase().includes(q));
  });

  // Asks a search function for each new text while the list is open.
  // Reopened on text the list already answers, it doesn't ask again (a
  // failed search is tried again).
  $effect(() => {
    if (Array.isArray(options) || !open) return;
    if (untrack(() => foundFor === query && !failed)) return;
    let current = true;
    searching = true;
    const search = options;
    const text = query;
    // A function that throws fails the same way as one that rejects.
    new Promise<T[]>((resolve) => resolve(search(text))).then(
      (answer) => settle(answer, false),
      () => settle([], true),
    );
    function settle(answer: T[], error: boolean) {
      // A newer text has been typed since; its answer is the one to show.
      if (!current) return;
      found = answer;
      foundFor = text;
      failed = error;
      searching = false;
      const count = answer.length;
      active =
        count === 0 || opening === 0 ? -1 : opening === 1 ? 0 : count - 1;
      opening = 0;
    }
    return () => {
      current = false;
    };
  });

  // The line under the options when there are none to show yet, or none
  // at all; both the list and the status region say it.
  const note = $derived(
    searching
      ? "Searching…"
      : failed
        ? "Couldn't search"
        : results.length === 0
          ? "No matches"
          : "",
  );

  // What the status region says to screen readers: how many match while
  // the list is open, then what was picked. "Searching…" isn't said, so
  // fast answers don't make it chatter.
  const announcement = $derived.by(() => {
    if (!open) return pickedMessage;
    if (searching) return "";
    if (note) return note;
    const count = results.length;
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
  // changes from outside (the page clears it), the box follows it. Keys, not the
  // options, are compared: a bound value comes back as a proxy.
  let shownKey: string | null = null;
  $effect.pre(() => {
    const key = keyOf(value);
    if (key === shownKey) return;
    shownKey = key;
    query = value == null ? "" : getText(value);
  });

  // The form sends the hidden input, so the box's own `required` only
  // checks for text. Text with no pick fails the form's check, required or
  // not, so typed text is never dropped silently; an empty box passes.
  $effect(() => {
    const unpicked = value == null && query !== "";
    input?.setCustomValidity(unpicked ? "Pick an option from the list." : "");
  });

  // A form reset empties the box but leaves the hidden input's value, so
  // the pick goes too. The reset lands after its event, unless cancelled.
  $effect(() => {
    const form = input?.form;
    if (!form) return;
    const onreset = (event: Event) => {
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        pick(null);
        query = "";
        pickedMessage = "";
      });
    };
    form.addEventListener("reset", onreset);
    return () => form.removeEventListener("reset", onreset);
  });

  /**
   * Sets the pick and nothing else: the box's text, the list and the
   * status region stay as they are. Typing calls it to undo a pick.
   */
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
    opening = 0;
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
    if (stale) {
      // The answer isn't in yet. The arrow that opened the list moves into
      // it once it is; one pressed in a list already open does nothing.
      if (!wasOpen) opening = step;
      return;
    }
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
    opening = 0;
  }

  /**
   * The member picks an option from the list: sets the pick, writes its
   * text in the box, says it in the status region and closes the list.
   */
  function choose(option: T) {
    pick(option);
    query = getText(option);
    pickedMessage = `${query}, selected`;
    close();
  }

  function onlistclick(event: MouseEvent & { currentTarget: HTMLElement }) {
    // The list still answers older text: its options may no longer match.
    if (stale) return;
    const row = (event.target as Element).closest("[role=option]");
    const index = row ? [...event.currentTarget.children].indexOf(row) : -1;
    if (index >= 0) choose(results[index]);
  }

  /** A handler that runs the caller's own handler, then the combobox's. */
  function chain<E extends Event>(
    caller: ((event: E) => unknown) | null | undefined,
    own: (event: E) => void,
  ) {
    return (event: E) => {
      caller?.(event);
      own(event);
    };
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
        // With nothing to clear, the Escape is left for a dialog round it.
        if (open || (query === "" && value == null)) break;
        event.preventDefault();
        pick(null);
        query = "";
        break;
      case "ArrowDown":
        event.preventDefault();
        // Alt+Down shows the list without moving into it.
        if (event.altKey) show();
        else move(1);
        break;
      case "ArrowUp":
        // Alt+Up hides the list; focus stays in the box. With the list
        // already closed, it's left to the page, as Escape is.
        if (event.altKey && !open) break;
        event.preventDefault();
        if (event.altKey) close();
        else move(-1);
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
    oninput={chain(callerInput, oninput)}
    onclick={chain(callerClick, show)}
    onblur={chain(callerBlur, close)}
    onkeydown={chain(callerKeydown, onkeydown)}
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
    {#if note}
      <p class="px-3 py-2 text-muted-foreground">{note}</p>
    {/if}
  </div>
  <div role="status" class="sr-only">{announcement}</div>
</div>
