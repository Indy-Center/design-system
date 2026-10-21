import { BROWSER } from "esm-env";
import { mount, unmount } from "svelte";
import ConfirmPrompt from "./ConfirmPrompt.svelte";

export type ConfirmActionOptions = {
  /** The question, short: "Delete event?". Names the dialog. */
  title: string;
  /** The question in full: what will happen. */
  message: string;
  /** What the confirm button says: the action, such as "Delete event". "Confirm" by default. */
  confirmLabel?: string;
  /** What the cancel button says. "Cancel" by default. */
  cancelLabel?: string;
  /** For an action that deletes or can't be undone. */
  danger?: boolean;
};

/**
 * Asks the member to confirm an action in a `ConfirmDialog`, in place of
 * `confirm()`: `if (await confirmAction({ … }))`. Resolves true if they
 * confirm, false if they cancel. The dialog is added to the page for the
 * question and removed after. On the server it resolves false at once.
 */
export function confirmAction(options: ConfirmActionOptions): Promise<boolean> {
  if (!BROWSER) return Promise.resolve(false);
  return new Promise((resolve) => {
    const prompt = mount(ConfirmPrompt, {
      target: document.body,
      props: {
        ...options,
        onanswer: (confirmed: boolean) => {
          void unmount(prompt);
          resolve(confirmed);
        },
      },
    });
  });
}
