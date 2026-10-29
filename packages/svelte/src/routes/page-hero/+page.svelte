<script lang="ts">
  import { Button, Heading, PageHero, Text } from "../../lib/index.ts";
</script>

<svelte:head><title>PageHero · Centerline playground</title></svelte:head>

<!-- The playground's own title is a plain h2 here: each specimen below
     renders an h1 of its own. -->
<h2 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  PageHero
</h2>

<p class="mb-4">
  Shown full width, as on a page, in each scheme. Each specimen renders an
  <code>h1</code>.
</p>

{#snippet welcome()}
  <Text lead class="mx-auto max-w-3xl">
    An integrated pilot and controller community on the VATSIM network. Join for
    events, learn to control, or fly with us.
  </Text>
  <div class="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
    <Button href="#join">Join our Discord</Button>
    <Button variant="secondary" href="#events">See events</Button>
  </div>
{/snippet}

<div class="space-y-6">
  {#each [{ name: "Light", theme: undefined }, { name: "Dark", theme: "dark" }] as scheme (scheme.name)}
    <section data-theme={scheme.theme} class="bg-background">
      <Heading level={3} look="label" class="px-4 py-2">{scheme.name}</Heading>
      <PageHero title="Welcome to Indy Center">
        {@render welcome()}
      </PageHero>
      <PageHero size="compact" title="Welcome, Jane Doe">
        <Text size="small">Controller (C1), visiting from ZAU</Text>
      </PageHero>
    </section>
  {/each}
</div>
