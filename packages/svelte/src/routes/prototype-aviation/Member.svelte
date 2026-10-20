<script lang="ts">
  // Round 3, as chosen: "Name · CID 1000001" (5D). A name-private member
  // shows their first name only. The CID is optional everywhere.
  import { Link } from "../../lib/index.ts";

  let {
    first,
    last,
    cid,
    hidden = false,
    showCid = true,
    href,
  }: {
    first: string;
    last: string;
    cid: number;
    hidden?: boolean;
    showCid?: boolean;
    href?: string;
  } = $props();

  const name = $derived(hidden ? first : `${first} ${last}`);
</script>

<span
  >{#if href}<Link {href}>{name}</Link>{:else}{name}{/if}{#if showCid}
    <span class="text-sm text-muted-foreground"
      >· CID <span class="font-mono">{cid}</span></span
    >{/if}</span
>
