<script lang="ts">
  import { Button, DropdownMenu, DropdownMenuItem } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let last = $state("nothing yet");
</script>

<svelte:head><title>DropdownMenu · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  DropdownMenu
</h1>

<p class="mb-4 text-foreground-soft">Last chosen: {last}</p>

<Schemes>
  <div class="flex flex-wrap items-center justify-end gap-4">
    <div class="flex">
      <Button class="rounded-r-none" onclick={() => (last = "Approve")}>
        Approve
      </Button>
      <DropdownMenu
        label="More actions for Jo Rivera"
        attached
        variant="primary"
      >
        <DropdownMenuItem href="#profile">View profile</DropdownMenuItem>
        <DropdownMenuItem onclick={() => (last = "Withdraw")}>
          Withdraw
        </DropdownMenuItem>
        <DropdownMenuItem onclick={() => (last = "Remove")}>
          Remove
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
    <div class="flex">
      <Button
        variant="secondary"
        class="rounded-r-none"
        onclick={() => (last = "Edit")}
      >
        Edit
      </Button>
      <DropdownMenu label="More actions for this event" attached>
        <DropdownMenuItem onclick={() => (last = "Duplicate")}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Cancel event</DropdownMenuItem>
      </DropdownMenu>
    </div>
    <DropdownMenu label="Actions for Jo Rivera" text="Actions">
      <DropdownMenuItem onclick={() => (last = "Copy CID")}>
        Copy CID
      </DropdownMenuItem>
      <DropdownMenuItem href="#history">Training history</DropdownMenuItem>
    </DropdownMenu>
  </div>
</Schemes>
