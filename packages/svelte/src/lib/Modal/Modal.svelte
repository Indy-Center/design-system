<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLDialogAttributes } from "svelte/elements";
  import CloseButton from "../CloseButton/CloseButton.svelte";
  import Heading from "../Heading/Heading.svelte";

  type Props = Omit<HTMLDialogAttributes, "open" | "title" | "onclose"> & {
    /** Whether it shows. Bind it (`bind:open`): it turns false when the member closes it. */
    open?: boolean;
    /** The heading at its top, which names it to screen readers. */
    title: string;
    /** How wide it can grow: `sm` 28rem, `md` 32rem (the default), `lg` 42rem. Never wider than the window. */
    size?: "sm" | "md" | "lg";
    /** Runs each time it closes, however it was closed. */
    onclose?: () => void;
    /** What it holds, below the heading. */
    children: Snippet;
    /** Its buttons, in a row at the foot, the main one last. */
    actions?: Snippet;
  };

  let {
    open = $bindable(false),
    title,
    size = "md",
    onclose,
    children,
    actions,
    onclick,
    onpointerdown,
    class: className,
    ...rest
  }: Props = $props();

  const id = $props.id();
  let dialog = $state<HTMLDialogElement>();
  // Where focus was when it opened, to go back to on closing.
  let returnTo: HTMLElement | null = null;
  // Whether the press that ends in a click began on the backdrop, so a
  // drag out of a field doesn't close it.
  let pressOnBackdrop = false;

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) {
      returnTo =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  });

  // Fires however it closes: Escape, the close button, a click outside,
  // or `open` set to false.
  function handleClose() {
    open = false;
    if (returnTo?.isConnected) returnTo.focus();
    returnTo = null;
    onclose?.();
  }

  // The panel fills the dialog, so a press on the dialog itself is on the
  // backdrop around it. (`closedby="any"` would do this, but Safari
  // doesn't have it yet.)
  // The caller's own handlers run first.
  function handlePointerDown(
    event: PointerEvent & { currentTarget: EventTarget & HTMLDialogElement },
  ) {
    onpointerdown?.(event);
    pressOnBackdrop = event.target === dialog;
  }

  function handleClick(
    event: MouseEvent & { currentTarget: EventTarget & HTMLDialogElement },
  ) {
    onclick?.(event);
    if (pressOnBackdrop && event.target === dialog) dialog.close();
    pressOnBackdrop = false;
  }
</script>

<!-- The dialog is keyboard-closable by Escape (native); the click is only
     for the backdrop. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  aria-labelledby="{id}-title"
  {...rest}
  onclose={handleClose}
  onpointerdown={handlePointerDown}
  onclick={handleClick}
  class={[
    "m-auto max-h-none w-[calc(100%-2rem)] overflow-hidden rounded-lg border border-border bg-card p-0 text-foreground shadow-xl",
    // Black in both schemes: the backdrop dims the page whatever its
    // colours, and ::backdrop doesn't see the roles' variables everywhere.
    "backdrop:bg-black/60",
    sizes[size],
    className,
  ]}
>
  <div class="max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-6">
    <div class="mb-4 flex items-start justify-between gap-4">
      <Heading level={2} id="{id}-title">{title}</Heading>
      <CloseButton aria-label="Close" onclick={() => dialog?.close()} />
    </div>
    <div class="text-foreground-soft">
      {@render children()}
    </div>
    {#if actions}
      <div class="mt-6 flex flex-wrap justify-end gap-3">
        {@render actions()}
      </div>
    {/if}
  </div>
</dialog>
