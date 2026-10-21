<script lang="ts">
  import { Button, PageHeader } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>PageHeader · Centerline playground</title></svelte:head>

<!-- The playground's own title is a plain h2 here: each specimen below
     renders an h1 of its own. -->
<h2 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  PageHeader
</h2>

<p class="mb-4">
  Each specimen renders an <code>h1</code>. The actions sit on the right from
  <code>sm</code> up; the columns here are narrow, so they stack.
</p>

<Schemes>
  <div class="space-y-8">
    <PageHeader title="Events">
      Upcoming events in Indy Center, with positions to sign up for.
      {#snippet actions()}
        <Button href="#new">New event</Button>
      {/snippet}
    </PageHeader>
    <PageHeader title="Roster" />
  </div>
</Schemes>

<!-- Full width, where the actions go to the right. -->
<PageHeader title="Events" class="mt-8">
  Upcoming events in Indy Center, with positions to sign up for.
  {#snippet actions()}
    <Button variant="secondary" href="#past">Past events</Button>
    <Button href="#new">New event</Button>
  {/snippet}
</PageHeader>
