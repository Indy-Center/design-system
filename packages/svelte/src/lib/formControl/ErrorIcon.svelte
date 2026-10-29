<script lang="ts">
  import { mdiAlertCircle } from "@mdi/js";
</script>

<!-- MDI's alert-circle, so an error isn't shown by colour alone. The text
     beside it says the error; the icon is hidden from screen readers. -->
<svg
  aria-hidden="true"
  viewBox="0 0 24 24"
  class="mt-0.5 size-4 shrink-0 fill-current"
>
  <path d={mdiAlertCircle} />
</svg>
