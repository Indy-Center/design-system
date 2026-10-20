<script lang="ts">
  // PROTOTYPE. One decision point: a bar to show all variants or one, then
  // the picked ones in <Schemes>, each labelled with its letter.
  import type { Snippet } from "svelte";
  import Schemes from "../../playground/Schemes.svelte";

  type Option = { key: string; desc: string; today?: boolean };

  let {
    id,
    title,
    question,
    options,
    recommend,
    start = "all",
    show,
  }: {
    id: string;
    title: string;
    question: string;
    options: Option[];
    recommend: string;
    start?: string;
    show: Snippet<[string]>;
  } = $props();

  // svelte-ignore state_referenced_locally
  let picked = $state(start);
  const visible = $derived(
    picked === "all" ? options : options.filter((o) => o.key === picked),
  );

  const btn =
    "min-h-11 min-w-11 rounded-md border border-border px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
</script>

<section {id} class="mb-14 scroll-mt-4">
  <h2 class="font-heading text-2xl font-semibold text-foreground">{title}</h2>
  <p class="mt-1 max-w-3xl text-muted-foreground">{question}</p>

  <ul class="mt-3 max-w-3xl space-y-1 text-sm">
    {#each options as o (o.key)}
      <li>
        <span class="font-mono font-semibold text-foreground">{o.key}</span>
        {o.desc}
        {#if o.today}<span class="text-muted-foreground"
            >(today's look, for comparison)</span
          >{/if}
      </li>
    {/each}
  </ul>
  <p class="mt-2 text-sm text-foreground">
    <span class="font-semibold">Recommend:</span>
    {recommend}
  </p>

  <div class="my-3 flex flex-wrap gap-2" role="group" aria-label="Variants">
    <button
      type="button"
      class={[btn, picked === "all" && "bg-primary text-primary-foreground"]}
      aria-pressed={picked === "all"}
      onclick={() => (picked = "all")}>All</button
    >
    {#each options as o (o.key)}
      <button
        type="button"
        class={[btn, picked === o.key && "bg-primary text-primary-foreground"]}
        aria-pressed={picked === o.key}
        onclick={() => (picked = o.key)}>{o.key}</button
      >
    {/each}
  </div>

  <Schemes>
    <div class="space-y-6">
      {#each visible as o (o.key)}
        <div>
          <p
            class="mb-2 border-b border-dashed border-border pb-1 font-mono text-xs text-muted-foreground"
          >
            <span class="font-semibold text-foreground">{o.key}</span>
            {o.today ? "· today" : ""}
          </p>
          {@render show(o.key)}
        </div>
      {/each}
    </div>
  </Schemes>
</section>
