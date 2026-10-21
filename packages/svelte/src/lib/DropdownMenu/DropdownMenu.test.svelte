<!-- A DropdownMenu for DropdownMenu.test.ts: a split button whose arrow
     opens a link and two buttons, and a button elsewhere on the page. -->
<script lang="ts">
  import Button from "../Button/Button.svelte";
  import DropdownMenu from "./DropdownMenu.svelte";
  import DropdownMenuItem from "./DropdownMenuItem.svelte";

  type Props = {
    /** Words beside the arrow; an arrow alone when left out. */
    text?: string;
    /** The arrow half of a split button. */
    attached?: boolean;
    /** The arrow's variant. */
    variant?: "primary" | "secondary";
    /** Moves the menu in from the window's left edge, so it has room. */
    inset?: boolean;
  };

  let {
    text,
    attached = false,
    variant = "secondary",
    inset = false,
  }: Props = $props();
  let withdrawn = $state(false);
</script>

<div class={["flex items-start gap-4", inset && "pl-80"]}>
  <div class="flex">
    {#if attached}
      <Button {variant} class="rounded-r-none">Approve</Button>
    {/if}
    <DropdownMenu
      label="More actions for Jo Rivera"
      {text}
      {attached}
      {variant}
    >
      <DropdownMenuItem href="#profile">View profile</DropdownMenuItem>
      <DropdownMenuItem onclick={() => (withdrawn = true)}>
        Withdraw
      </DropdownMenuItem>
      <DropdownMenuItem>Remove</DropdownMenuItem>
    </DropdownMenu>
  </div>
  <button type="button">Elsewhere</button>
</div>
<p data-testid="withdrawn">{withdrawn ? "yes" : "no"}</p>
