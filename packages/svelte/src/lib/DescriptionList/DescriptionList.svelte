<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLDListElement> & {
    /** The rows: a `<div>` around each `<dt>` and its `<dd>`. */
    children: Snippet;
  };

  let { children, class: className, ...rest }: Props = $props();
</script>

<!-- Each row stacks until the list itself is 24rem wide, then puts the
     value beside its term; a container query, so a list in a narrow
     column stacks too. Written on the rows from here, so a document's
     plain <dl> could share it later. -->
<dl
  {...rest}
  class={[
    "@container divide-y divide-border text-sm",
    "[&>div]:py-3 @sm:[&>div]:grid @sm:[&>div]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @sm:[&>div]:gap-x-4 @sm:[&>div]:gap-y-1",
    "[&_dt]:font-medium [&_dt]:text-muted-foreground",
    "[&_dd]:mt-1 @sm:[&_dd]:col-start-2 @sm:[&_dd]:mt-0 [&_dd]:text-foreground",
    className,
  ]}
>
  {@render children()}
</dl>
