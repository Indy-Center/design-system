<script lang="ts">
  // An MDI path as a decorative 20px icon in the current colour.
  let { path, size = 20 }: { path: string; size?: number } = $props();
</script>

<svg
  viewBox="0 0 24 24"
  width={size}
  height={size}
  fill="currentColor"
  aria-hidden="true"
  focusable="false"><path d={path} /></svg
>
