<!-- "(required)" in words, after a label or legend. Hidden from screen
     readers when the control's own `required` already says it. -->
<script lang="ts">
  type Props = {
    /** Whether screen readers read it, as part of the name. */
    announced: boolean;
  };

  let { announced }: Props = $props();
</script>

<span
  aria-hidden={announced ? undefined : "true"}
  class="font-normal text-muted-foreground">(required)</span
>
