<!-- A Checkbox's or Radio's text, inside its label: the label, and under it
     any children, which say more about the option. With children, the
     label and children take the ids that the input's `aria-labelledby`
     and `aria-describedby` point at (`choiceLabelId`, and the hint's id
     from `descriptionIds`), so the label alone names the input. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { choiceLabelId, descriptionIds } from "./formControl.js";

  type Props = {
    /** The base id the label's and children's ids are made from. */
    id: string;
    /** The label's text. */
    label: string;
    /** More about the option, under the label. */
    children?: Snippet;
  };

  let { id, label, children }: Props = $props();
</script>

{#if children}
  <span class="flex flex-col gap-0.5">
    <span id={choiceLabelId(id)}>{label}</span>
    <span id={descriptionIds(id).hint} class="text-sm text-muted-foreground">
      {@render children()}
    </span>
  </span>
{:else}
  <span>{label}</span>
{/if}
