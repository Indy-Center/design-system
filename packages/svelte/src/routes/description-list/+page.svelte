<script lang="ts">
  import { DescriptionList, Link } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <DescriptionList>
    <div>
      <dt>CID</dt>
      <dd class="font-mono">1234567</dd>
    </div>
    <div>
      <dt>Rating</dt>
      <dd>Controller (C1)</dd>
    </div>
    <div>
      <dt>Home facility</dt>
      <dd><Link href="/roster">Indianapolis ARTCC</Link></dd>
    </div>
    <div>
      <dt>Endorsements</dt>
      <dd>IND Tier 1</dd>
      <dd>SDF Tower</dd>
    </div>
  </DescriptionList>
</Schemes>

<!-- Wider than 24rem, the values move beside their labels. -->
<section class="mt-4 rounded-lg border border-border bg-card p-4">
  <DescriptionList>
    <div>
      <dt>Status</dt>
      <dd>Waiting for a teacher</dd>
    </div>
    <div>
      <dt>Requested</dt>
      <dd>2026-10-18</dd>
    </div>
    <div>
      <dt>Endorsements</dt>
      <dd>IND Tier 1</dd>
      <dd>SDF Tower</dd>
    </div>
  </DescriptionList>
</section>
