<script lang="ts">
  // The ConfirmDialog that confirmAction() mounts: open from the start,
  // holding a plain-text message.
  import type { ComponentProps } from "svelte";
  import ConfirmDialog from "./ConfirmDialog.svelte";

  type Props = Omit<
    ComponentProps<typeof ConfirmDialog>,
    "open" | "children" | "onconfirm" | "oncancel"
  > & {
    /** The question in full, as text. */
    message: string;
    /** Called once, with whether the member confirmed. */
    onanswer: (confirmed: boolean) => void;
  };

  let { message, onanswer, ...options }: Props = $props();
  let open = $state(true);
</script>

<ConfirmDialog
  bind:open
  {...options}
  onconfirm={() => onanswer(true)}
  oncancel={() => onanswer(false)}
>
  <!-- Keeps a blank line between paragraphs, as confirm() did. -->
  <p class="whitespace-pre-line">{message}</p>
</ConfirmDialog>
