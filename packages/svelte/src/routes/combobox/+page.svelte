<script lang="ts">
  import { Combobox, Field } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  type Controller = { cid: string; name: string; initials: string };

  // Made-up members, for the specimen.
  const controllers: Controller[] = [
    { cid: "1000001", name: "Ann Archer", initials: "AA" },
    { cid: "1000002", name: "Ben Baker", initials: "BB" },
    { cid: "1000003", name: "Cara Cole", initials: "CC" },
    { cid: "1000004", name: "Dan Andrews", initials: "DA" },
    { cid: "1000005", name: "Eve Evans", initials: "EE" },
    { cid: "1000006", name: "Finn Fox", initials: "FF" },
    { cid: "1000007", name: "Gail Green", initials: "GG" },
    { cid: "1000008", name: "Hal Hughes", initials: "HH" },
  ];

  /** Matches name, initials or CID, as a server would, after a pause. */
  async function searchControllers(query: string) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const q = query.trim().toLowerCase();
    return controllers.filter((c) =>
      [c.name, c.initials, c.cid].some((f) => f.toLowerCase().includes(q)),
    );
  }

  const positions = ["IND_CTR", "IND_APP", "IND_TWR", "IND_GND", "SDF_APP"];
</script>

<svelte:head><title>Combobox · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Combobox
</h1>

<Schemes>
  <form class="space-y-4" onsubmit={(event) => event.preventDefault()}>
    <Field label="Controller" hint="Start typing a name.">
      {#snippet children(control)}
        <Combobox
          {...control}
          name="controller"
          options={controllers}
          getText={(c) => c.name}
          getKey={(c) => c.cid}
        >
          {#snippet option(c)}
            <span class="flex-1">{c.name}</span>
            <span class="font-mono text-sm text-muted-foreground">{c.cid}</span>
          {/snippet}
        </Combobox>
      {/snippet}
    </Field>
    <Field label="Member" hint="Name, initials or CID; searched as you type.">
      {#snippet children(control)}
        <Combobox
          {...control}
          name="member"
          options={searchControllers}
          getText={(c) => c.name}
          getKey={(c) => c.cid}
        />
      {/snippet}
    </Field>
    <Field label="Position" error="Pick a position from the list." required>
      {#snippet children(control)}
        <Combobox {...control} name="position" options={positions} />
      {/snippet}
    </Field>
  </form>
</Schemes>
