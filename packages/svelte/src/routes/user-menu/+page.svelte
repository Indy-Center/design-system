<script lang="ts">
  // The menu belongs in the dark header and has no background of its own,
  // so it is shown in a dark header band on a light page and on a dark
  // page, rather than in <Schemes>' bare light column. Choosing a colour
  // scheme in it saves the playground's cookie and switches the page.
  import { UserMenu } from "../../lib/index.ts";

  const label =
    "mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase";
</script>

<div class="grid gap-4 lg:grid-cols-2">
  {#each ["Light page", "Dark page"] as name}
    <!-- Room under each, for the open menu. -->
    <section
      data-theme={name === "Dark page" ? "dark" : undefined}
      class="min-h-[44rem] rounded-lg border border-border bg-background p-4"
    >
      <h2 class={label}>{name}</h2>
      <header
        data-theme="dark"
        class="flex justify-end rounded-md bg-background p-2"
      >
        <UserMenu
          name="Sam Rivera"
          cid={1234567}
          rating="S3"
          pilotRating={1}
          hub="/"
          signOutHref="#sign-out"
        />
      </header>
    </section>
  {/each}
</div>
