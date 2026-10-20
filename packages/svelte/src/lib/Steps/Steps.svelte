<script lang="ts" module>
  /** One step: what it is, and whether it's done, current or to come. */
  export type Step = {
    /** What the step is: "Rating exam". */
    label: string;
    state: "done" | "current" | "upcoming";
    /** A line under the label: who, or what happens next. */
    detail?: string;
    /** When the step happened, as text beside the label. */
    date?: string;
  };
</script>

<script lang="ts">
  import type { HTMLOlAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";

  type Props = Omit<HTMLOlAttributes, "children"> & {
    /** The steps, first to last. */
    steps: Step[];
  };

  let { steps, class: className, ...rest }: Props = $props();

  // MDI's check-circle, record-circle and circle-outline: each state has its
  // own shape, so it isn't told by colour alone.
  const looks = {
    done: {
      path: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z",
      icon: "text-success",
      label: "font-medium text-foreground",
    },
    current: {
      path: "M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 7a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3",
      icon: "text-info",
      label: "font-medium text-foreground",
    },
    upcoming: {
      path: "M12 20a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2",
      icon: "text-muted-foreground",
      label: "text-muted-foreground",
    },
  } as const;
</script>

<!-- Preflight takes the list style off, and Safari then stops calling it a
     list, so the role is said again. -->
<!-- svelte-ignore a11y_no_redundant_roles -->
<ol role="list" {...rest} class={["text-sm", className]}>
  {#each steps as step, index (index)}
    {@const look = looks[step.state]}
    <li
      aria-current={step.state === "current" ? "step" : undefined}
      class="relative flex gap-3 pb-5 last:pb-0"
    >
      {#if index < steps.length - 1}
        <!-- The line down to the next step. -->
        <span
          aria-hidden="true"
          class="absolute top-6 bottom-0.5 left-2.5 w-px bg-border"
        ></span>
      {/if}
      <Icon path={look.path} size={20} class={look.icon} />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-baseline justify-between gap-x-3">
          <span class={look.label}>
            {step.label}
            {#if step.state === "done"}
              <span class="sr-only">(done)</span>
            {/if}
          </span>
          {#if step.date}
            <span class="text-xs text-muted-foreground">{step.date}</span>
          {/if}
        </div>
        {#if step.detail}
          <p class="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
        {/if}
      </div>
    </li>
  {/each}
</ol>
