<script lang="ts" module>
  export type MemberFormat = "A" | "B" | "C" | "D";
  // How a name-private member shows: today's (CID as last name), first name
  // only, or the CID alone.
  export type Privacy = "today" | "first" | "cid";
</script>

<script lang="ts">
  // Round 2: one member, in the format the page's switch picks.
  import { Link } from "../../lib/index.ts";

  let {
    first,
    last,
    cid,
    hidden = false,
    format,
    privacy,
    href,
  }: {
    first: string;
    last: string;
    cid: number;
    hidden?: boolean;
    format: MemberFormat;
    privacy: Privacy;
    href?: string;
  } = $props();

  const name = $derived(
    !hidden
      ? `${first} ${last}`
      : privacy === "today"
        ? `${first} ${cid}`
        : privacy === "first"
          ? first
          : "",
  );
</script>

{#snippet label()}{#if href}<Link {href}>{name}</Link
    >{:else}{name}{/if}{/snippet}

{#if !name}
  <!-- CID alone -->
  {#if format === "A" || format === "B"}
    <span class="font-mono text-foreground">{cid}</span>
  {:else}
    <span class="text-muted-foreground"
      >CID <span class="font-mono text-foreground">{cid}</span></span
    >
  {/if}
{:else if format === "A"}
  <span
    >{@render label()}
    <span class="font-mono text-sm text-muted-foreground">{cid}</span></span
  >
{:else if format === "B"}
  <span
    >{@render label()}
    <span class="font-mono text-sm text-muted-foreground">({cid})</span></span
  >
{:else if format === "C"}
  <span class="inline-block align-top leading-tight">
    <span class="block">{@render label()}</span>
    <span class="block font-mono text-xs text-muted-foreground">CID {cid}</span>
  </span>
{:else}
  <span
    >{@render label()}
    <span class="text-sm text-muted-foreground"
      >· CID <span class="font-mono">{cid}</span></span
    ></span
  >
{/if}
