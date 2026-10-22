<script lang="ts">
  // The header is a full-width band and the same in both schemes, so it is
  // shown full width on a light page and on a dark page, rather than in the
  // three narrow columns of <Schemes>: in an app with a member signed in,
  // and on the hub signed out. Narrow the window below lg (1024px) for the
  // phone menu.
  import { Header, INDY_CENTER_APPS } from "../../lib/index.ts";
  import { hubNav } from "../../playground/chrome.ts";

  const training = INDY_CENTER_APPS.find((app) => app.label === "Training");
  const signInHref = "#sign-in";
  const signOutHref = "#sign-out";
  const member = {
    name: "Sam Rivera",
    cid: 1234567,
    rating: "S3",
    pilotRating: 1,
  };

  const label =
    "mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase";
</script>

<svelte:head><title>Header · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Header</h1>

<div class="grid gap-4">
  {#each ["Light page", "Dark page"] as name}
    <!-- Room under each, for an open menu. -->
    <section
      data-theme={name === "Dark page" ? "dark" : undefined}
      class="min-h-[44rem] rounded-lg border border-border bg-background p-4"
    >
      <h2 class={label}>{name}</h2>

      <h3 class="mb-2 text-sm font-medium text-foreground">
        In an app, signed in
      </h3>
      <!-- Each in its own box, so it sticks only within it. -->
      <div class="mb-6">
        <Header
          app={training}
          nav={hubNav}
          current="/staff"
          {member}
          {signInHref}
          {signOutHref}
        />
      </div>

      <h3 class="mb-2 text-sm font-medium text-foreground">
        On the hub, signed out
      </h3>
      <div>
        <Header nav={hubNav} current="/events" {signInHref} {signOutHref} />
      </div>
    </section>
  {/each}
</div>
