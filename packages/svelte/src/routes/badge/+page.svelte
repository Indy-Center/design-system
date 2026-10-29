<script lang="ts">
  import { Badge, BADGE_VARIANTS, Icon } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  // From @mdi/js: mdiStar.
  const star =
    "M12,17.27L18.18,21L16.54,13.64L22,8.24L14.81,7.62L12,1L9.19,7.62L2,8.24L7.45,13.64L5.82,21L12,17.27Z";
</script>

<Schemes>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-2">
      {#each BADGE_VARIANTS as variant (variant)}
        <Badge {variant}>{variant}</Badge>
      {/each}
    </div>
    <div class="flex flex-wrap gap-2">
      {#each BADGE_VARIANTS as variant (variant)}
        <Badge {variant} size="sm">{variant}</Badge>
      {/each}
    </div>
    <div class="flex flex-wrap gap-2">
      <Badge variant="gray" pill>Draft</Badge>
      <Badge variant="green" pill>In progress</Badge>
      <Badge variant="sky" pill>Next event</Badge>
    </div>
    <div class="flex flex-wrap gap-2">
      <Badge variant="yellow" size="sm">
        {#snippet icon()}<Icon path={star} />{/snippet}
        Member perk
      </Badge>
      <Badge variant="purple">
        {#snippet icon()}<Icon path={star} />{/snippet}
        Community
      </Badge>
    </div>
    <div class="flex flex-wrap gap-2 rounded-md bg-card p-3">
      <span class="text-sm">On a card:</span>
      {#each BADGE_VARIANTS as variant (variant)}
        <Badge {variant} size="sm">{variant}</Badge>
      {/each}
    </div>
  </div>
</Schemes>
