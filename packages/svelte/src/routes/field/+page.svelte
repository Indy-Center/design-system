<script lang="ts">
  import { Field, Input, Select, Textarea } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <form class="space-y-4" onsubmit={(event) => event.preventDefault()}>
    <Field label="Callsign" hint="As you log on to VATSIM." required>
      {#snippet children(control)}
        <Input {...control} name="callsign" placeholder="IND_CTR" />
      {/snippet}
    </Field>
    <Field
      label="Frequency"
      hint="In megahertz, three decimals."
      error="Enter a frequency such as 128.225."
    >
      {#snippet children(control)}
        <Input {...control} name="frequency" value="128.2" />
      {/snippet}
    </Field>
    <Field label="Rating">
      {#snippet children(control)}
        <Select {...control} name="rating" value="S2">
          <option value="S1">S1</option>
          <option value="S2">S2</option>
          <option value="S3">S3</option>
        </Select>
      {/snippet}
    </Field>
    <Field label="Comments" error="Tell us what went well.">
      {#snippet children(control)}
        <Textarea {...control} name="comments" rows={3} />
      {/snippet}
    </Field>
  </form>
</Schemes>
