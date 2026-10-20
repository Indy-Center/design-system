<script lang="ts">
  // PROTOTYPE: the one-line note by a control, per note variant.
  import { chosen, NOTE } from "./prefs.svelte.ts";
  import { note, focus } from "./cls.ts";

  let { text = NOTE, saved = false }: { text?: string; saved?: boolean } =
    $props();
  let open = $state(false);
  const id = $props.id();
</script>

{#if chosen.note === "A"}
  <p class="{note} px-3 pb-2">{text}</p>
{:else if chosen.note === "B"}
  <p class="{note} px-3 pb-2" aria-live="polite">{saved ? text : ""}</p>
{:else}
  <div class="px-3 pb-1">
    <button
      type="button"
      class="inline-flex min-h-11 min-w-11 cursor-pointer items-center gap-1 rounded-md text-xs text-muted-foreground hover:text-foreground {focus}"
      aria-expanded={open}
      aria-controls="note-{id}"
      onclick={() => (open = !open)}
      ><span
        aria-hidden="true"
        class="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-semibold"
        >i</span
      > What's saved?</button
    >
    <p id="note-{id}" class={note} hidden={!open}>{text}</p>
  </div>
{/if}
