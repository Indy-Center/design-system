<script lang="ts">
  // A description list as a page writes one, for DescriptionList's tests.
  import type { ComponentProps } from "svelte";
  import DescriptionList from "./DescriptionList.svelte";

  let props: Omit<
    ComponentProps<typeof DescriptionList>,
    "children"
  > = $props();
</script>

<DescriptionList {...props}>
  <div>
    <dt>CID</dt>
    <dd class="font-mono">1234567</dd>
  </div>
  <div>
    <dt>Rating</dt>
    <dd>Controller (C1)</dd>
  </div>
  <div>
    <dt>Endorsements</dt>
    <dd>IND Tier 1</dd>
    <dd>SDF Tower</dd>
  </div>
</DescriptionList>
