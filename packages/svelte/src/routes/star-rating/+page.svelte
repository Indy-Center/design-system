<script lang="ts">
  import { StarDisplay, StarRating } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let rating = $state<number>();
</script>

<!-- Each copy is its own form, so its radios are their own group. -->
<Schemes>
  <div class="space-y-5">
    <form>
      <StarRating
        legend="How was your session?"
        name="rating"
        hint="Only training staff see it."
        required
        bind:value={rating}
      />
    </form>
    <form>
      <StarRating legend="Your last rating" name="rating" value={3} disabled />
    </form>
    <p class="flex items-center gap-2 text-foreground-soft">
      <StarDisplay value={4.3} />
      <span class="text-sm">Average of 12 sessions</span>
    </p>
  </div>
</Schemes>

<p class="mt-4 text-foreground-soft">Chosen: {rating ?? "none"}</p>
