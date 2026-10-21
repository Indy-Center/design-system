<script lang="ts">
  import { mdiAlertCircleOutline, mdiCheck, mdiContentCopy } from "@mdi/js";
  import { tick } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";

  type Props = Omit<
    HTMLButtonAttributes,
    "children" | "onclick" | "type" | "aria-label"
  > & {
    /** The text put on the clipboard. */
    text: string;
    /** What it copies, for the button's name: "frequency" names it "Copy frequency". */
    label: string;
  };

  let { text, label, class: className, ...rest }: Props = $props();

  // How long the outcome shows: a moment for "Copied", longer for a
  // failure, which the member has to act on.
  const SHOWN_FOR = { copied: 2000, failed: 5000 };

  const outcomes = {
    copied: { message: "Copied", icon: mdiCheck },
    failed: { message: "Couldn't copy", icon: mdiAlertCircleOutline },
  };

  let outcome = $state<keyof typeof outcomes | undefined>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy() {
    let result: keyof typeof outcomes;
    try {
      // Undefined outside a secure context (plain http), so that throws too.
      await navigator.clipboard.writeText(text);
      result = "copied";
    } catch {
      result = "failed";
    }
    clearTimeout(timer);
    // Empty the live region first, so a second press is read again.
    if (outcome) {
      outcome = undefined;
      await tick();
    }
    outcome = result;
    timer = setTimeout(() => (outcome = undefined), SHOWN_FOR[result]);
  }

  $effect(() => () => clearTimeout(timer));
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
