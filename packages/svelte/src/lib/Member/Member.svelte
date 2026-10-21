<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Link from "../Link/Link.svelte";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** The name as the app shows it; for a name-private member, the first name alone. */
    name: string;
    /** The member's VATSIM CID: `1000001`. */
    cid: number | string;
    /** Whether the CID shows after the name. On by default; each place decides. */
    showCid?: boolean;
    /** Where the name links to, such as the member's profile. */
    href?: string;
  };

  let {
    name,
    cid,
    showCid = true,
    href,
    class: className,
    ...rest
  }: Props = $props();
</script>

<span {...rest} class={className}
  >{#if href}<Link {href}>{name}</Link>{:else}{name}{/if}{#if showCid}<span
      class="text-sm text-muted-foreground"
      >{" "}<span aria-hidden="true">·</span> CID
      <span class="font-mono">{cid}</span></span
    >{/if}</span
>
