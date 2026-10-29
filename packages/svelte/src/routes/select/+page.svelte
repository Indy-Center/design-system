<script lang="ts">
  import { Select } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <div class="space-y-3">
    <Select aria-label="Rating" value="">
      <option value="" disabled>Choose a rating</option>
      <option value="S1">S1</option>
      <option value="S2">S2</option>
      <option value="S3">S3</option>
    </Select>
    <Select aria-label="Sort by" value="name">
      <optgroup label="Sort by">
        <option value="name">Name</option>
        <option value="rating">Rating</option>
        <option value="hours">Hours on position this month</option>
      </optgroup>
    </Select>
    <Select aria-label="Invalid" aria-invalid={true} value="">
      <option value="" disabled>Choose a facility</option>
    </Select>
  </div>
</Schemes>
