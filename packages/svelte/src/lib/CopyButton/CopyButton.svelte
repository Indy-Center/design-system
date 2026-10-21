<script lang="ts">
  import { mdiAlertCircleOutline, mdiCheck, mdiContentCopy } from "@mdi/js";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";

  type Props = Omit<
    HTMLButtonAttributes,
    "children" | "onclick" | "type" | "aria-label" | "aria-labelledby"
  > & {
    /** The text put on the clipboard. */
    text: string;
    /** What it copies, for the button's name: "frequency" names it "Copy frequency". */
    label: string;
  };

  let { text, label, class: className, ...rest }: Props = $props();

  // Each outcome's message, icon and how long it shows: a moment for
  // "Copied", longer for a failure, which the member has to act on.
  const outcomes = {
    copied: { message: "Copied", icon: mdiCheck, shownFor: 2000 },
    failed: {
      message: "Couldn't copy",
      icon: mdiAlertCircleOutline,
      shownFor: 5000,
    },
  };

  // How long the live region stays empty before a second press's message,
  // so screen readers hear a change rather than merging the two.
  const REFILL_AFTER = 100;

  let outcome = $state<keyof typeof outcomes | undefined>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let gone = false;

  function show(result: keyof typeof outcomes) {
    outcome = result;
    timer = setTimeout(() => (outcome = undefined), outcomes[result].shownFor);
  }

  async function copy() {
    let result: keyof typeof outcomes;
    try {
      // Undefined outside a secure context (plain http), so that throws too.
      await navigator.clipboard.writeText(text);
      result = "copied";
    } catch {
      result = "failed";
    }
    if (gone) return;
    clearTimeout(timer);
    // Empty the live region first, so a second press is read again.
    if (outcome) {
      outcome = undefined;
      timer = setTimeout(() => show(result), REFILL_AFTER);
    } else {
      show(result);
    }
  }

  $effect(() => () => {
    gone = true;
    clearTimeout(timer);
  });
</script>

<span class={["inline-flex items-center", className]}>
  <Button
    variant="secondary"
    size="sm"
    {...rest}
    aria-label="Copy {label}"
    onclick={copy}
  >
    <Icon path={outcome ? outcomes[outcome].icon : mdiContentCopy} size={18} />
  </Button>
  <!-- On the page from the start, empty until a press, so the change is
       announced. Beside the button, not in it: a button's children are
       presentational. -->
  <span role="status" class="text-sm text-muted-foreground">
    {#if outcome}
      <span class="ms-2 whitespace-nowrap">{outcomes[outcome].message}</span>
    {/if}
  </span>
</span>
