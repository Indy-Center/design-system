<!-- A Combobox for Combobox.test.ts: in a Field, inside a form, with the
     picked controller's CID shown beside it and a button elsewhere. -->
<script lang="ts">
  import Field from "../Field/Field.svelte";
  import Combobox from "./Combobox.svelte";

  type Controller = { cid: string; name: string };

  type Props = {
    /** The list, or a search function. */
    options?:
      Controller[] | ((query: string) => Controller[] | Promise<Controller[]>);
    /** The controller picked to start with. */
    value?: Controller | null;
    /** Field's hint. */
    hint?: string;
    /** Field's error. */
    error?: string;
    /** Draws options with their CID when set. */
    withCid?: boolean;
  };

  let {
    options = [
      { cid: "1000001", name: "Ann Archer" },
      { cid: "1000002", name: "Ben Baker" },
      { cid: "1000003", name: "Cara Cole" },
    ],
    value = $bindable(null),
    hint,
    error,
    withCid = false,
  }: Props = $props();
</script>

<!-- In a row, so the open list doesn't cover the button. -->
<div class="flex items-start gap-4">
  <form class="w-64" onsubmit={(event) => event.preventDefault()}>
    <Field label="Controller" {hint} {error}>
      {#snippet children(control)}
        <Combobox
          {...control}
          {options}
          bind:value
          name="controller"
          getText={(c) => c.name}
          getKey={(c) => c.cid}
        >
          {#snippet option(c)}
            {c.name}{#if withCid}<span class="font-mono"> {c.cid}</span>{/if}
          {/snippet}
        </Combobox>
      {/snippet}
    </Field>
  </form>
  <button type="button">Elsewhere</button>
</div>
<p data-testid="picked">{value?.cid ?? "none"}</p>
