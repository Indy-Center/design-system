<script lang="ts">
  import { enhance } from "$app/forms";
  import {
    Icon,
    SEVERITIES,
    toast,
    Toaster,
    type Severity,
  } from "../../lib/index.ts";

  const levels = Object.keys(SEVERITIES) as Severity[];
  const messages: Record<Severity, string> = {
    info: "ZID_CTR is now open on the schedule.",
    success: "Your session request was sent.",
    caution: "Your training session starts in 10 minutes.",
    danger: "We couldn't save the roster. Try again.",
  };

  const button =
    "inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
</script>

<svelte:head><title>Toast · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Toast</h1>

<p class="mb-4">
  Raise toasts; they show below the playground's header. "Raise and reload"
  shows one surviving a full-page load. The two form buttons post to a form
  action that raises a toast on the server and redirects: one with a full page
  load, one with <code>use:enhance</code>.
</p>

<div class="flex flex-wrap gap-2">
  {#each levels as level (level)}
    <button
      type="button"
      class={button}
      onclick={() => toast(level, messages[level])}
    >
      <Icon path={SEVERITIES[level].icon} class={SEVERITIES[level].text} />
      {SEVERITIES[level].label}
    </button>
  {/each}
  <button
    type="button"
    class={button}
    onclick={() => levels.forEach((l) => toast(l, messages[l]))}
  >
    All four
  </button>
  <button
    type="button"
    class={button}
    onclick={() => {
      toast("success", "Saved before the reload.");
      location.reload();
    }}
  >
    Raise and reload
  </button>
  <form method="POST">
    <button class={button}>Save on the server</button>
  </form>
  <form method="POST" use:enhance>
    <button class={button}>Save on the server, enhanced</button>
  </form>
</div>

<!-- Not in <Schemes>: the toasts are fixed to the window, so there's one
     Toaster, in the page's scheme. The playground's header is about
     3.25rem tall. -->
<div style="--centerline-header-height: 3.25rem">
  <Toaster />
</div>
