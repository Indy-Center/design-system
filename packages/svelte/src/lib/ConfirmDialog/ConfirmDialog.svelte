<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";
  import Button from "../Button/Button.svelte";
  import Modal from "../Modal/Modal.svelte";

  type Props = Omit<
    ComponentProps<typeof Modal>,
    "children" | "actions" | "onclose" | "size"
  > & {
    /** What the confirm button says: the action, such as "Delete event". "Confirm" by default. */
    confirmLabel?: string;
    /** What the cancel button says. "Cancel" by default. */
    cancelLabel?: string;
    /** For an action that deletes or can't be undone: a danger confirm button, and focus starts on Cancel. */
    danger?: boolean;
    /** Runs after it closes from the confirm button. */
    onconfirm?: () => void;
    /** Runs after it closes any other way: Cancel, Escape, the close button, a click outside. */
    oncancel?: () => void;
    /** The question in full: what will happen. */
    children: Snippet;
  };

  let {
    open = $bindable(false),
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
    onconfirm,
    oncancel,
    children,
    ...rest
  }: Props = $props();

  const id = $props.id();
  // Set by the confirm button just before it closes the dialog.
  let confirmed = false;

  function handleClose() {
    const answer = confirmed;
    confirmed = false;
    if (answer) onconfirm?.();
    else oncancel?.();
  }
</script>

<Modal
  bind:open
  role="alertdialog"
  aria-describedby="{id}-message"
  size="sm"
  {...rest}
  onclose={handleClose}
>
  <div id="{id}-message">{@render children()}</div>
  {#snippet actions()}
    <!-- Focus starts on the safer button for a dangerous action: the
         dialog's showModal() focuses the one with autofocus. -->
    <Button
      variant="secondary"
      autofocus={danger}
      onclick={() => (open = false)}
    >
      {cancelLabel}
    </Button>
    <Button
      variant={danger ? "danger" : "primary"}
      autofocus={!danger}
      onclick={() => {
        confirmed = true;
        open = false;
      }}
    >
      {confirmLabel}
    </Button>
  {/snippet}
</Modal>
