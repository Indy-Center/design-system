<script lang="ts">
  // Throwaway Toast demo: buttons raise real toasts in the chosen placement,
  // duration, dismissal and stacking, announced through live regions that
  // are on the page from the start.
  import { mdiClose } from "@mdi/js";
  import { onDestroy, onMount } from "svelte";
  import Icon from "./Icon.svelte";
  import { icon, levels, spoken, text, type Level } from "./levels.ts";

  type Option = { id: string; label: string; note: string };

  const placements: Option[] = [
    {
      id: "A",
      label: "A · Top right",
      note: "Top right on every width; full width at the top on a phone.",
    },
    {
      id: "B",
      label: "B · Bottom centre",
      note: "Bottom centre on every width; full width at the bottom on a phone.",
    },
    {
      id: "C",
      label: "C · Top right, bottom on a phone",
      note: "Top right from 640px; below that, full width at the bottom, near the thumb.",
    },
  ];
  const durations: Option[] = [
    {
      id: "A",
      label: "A · 5 s, all levels",
      note: "Every toast leaves after 5 seconds, hover or not.",
    },
    {
      id: "B",
      label: "B · 8 s, pauses",
      note: "8 seconds; the clock stops while the pointer or focus is on the toasts.",
    },
    {
      id: "C",
      label: "C · By level",
      note: "Info and success 6 s (pausing); caution and danger stay until dismissed.",
    },
  ];
  const dismissals: Option[] = [
    {
      id: "A",
      label: "A · Close button",
      note: "Every toast has a 44px close button; Escape closes the newest.",
    },
    {
      id: "B",
      label: "B · None",
      note: "No button; toasts only time out (a toast that would stay gets 10 s).",
    },
  ];
  const stackings: Option[] = [
    {
      id: "A",
      label: "A · List, 3 at most",
      note: "Newest nearest the edge; up to 3 shown, the rest wait their turn.",
    },
    {
      id: "B",
      label: "B · Pile",
      note: "Newest on top, older ones peek behind; hover or focus spreads them out.",
    },
    {
      id: "C",
      label: "C · One at a time",
      note: "A new toast replaces the one showing.",
    },
  ];

  let placement = $state("B");
  let duration = $state("C");
  let dismissal = $state("A");
  let stacking = $state("A");
  let scheme = $state<"light" | "dark">("light");

  type Toast = {
    id: number;
    level: Level;
    message: string;
    left: number;
    total: number;
  };
  let toasts = $state<Toast[]>([]);
  let queue: Toast[] = [];
  let paused = $state(false);
  let expanded = $state(false);
  let nextId = 1;

  const polite = $state<string[]>([]);
  const assertive = $state<string[]>([]);
  let log = $state<string[]>([]);

  const messages: Record<Level, string> = {
    info: "ZID_CTR is now open on the schedule.",
    success: "Your session request was sent.",
    caution: "Your training session starts in 10 minutes.",
    danger: "We couldn't save the roster. Try again.",
  };

  function lifetime(level: Level) {
    if (duration === "A") return 5000;
    if (duration === "B") return 8000;
    if (level === "info" || level === "success") return 6000;
    return dismissal === "B" ? 10000 : Infinity;
  }

  function announce(level: Level, message: string) {
    const said = `${spoken[level]}: ${message}`;
    log = [said, ...log].slice(0, 4);
    // Clear, then set, so a repeat of the same words is read again.
    // Each message is a line added to its region, so several in a row are
    // all read; lines are cleared a while later, which isn't announced.
    const lines = level === "danger" ? assertive : polite;
    lines.push(said);
    setTimeout(() => lines.splice(lines.indexOf(said), 1), 7000);
  }

  function raise(level: Level) {
    const total = lifetime(level);
    const toast = {
      id: nextId++,
      level,
      message: messages[level],
      left: total,
      total,
    };
    if (stacking === "C") {
      toasts = [toast];
      queue = [];
    } else if (stacking === "A" && toasts.length >= 3) {
      queue.push(toast);
    } else {
      toasts = [toast, ...toasts];
    }
    announce(level, toast.message);
  }

  function remove(id: number) {
    toasts = toasts.filter((t) => t.id !== id);
    const waiting = queue.shift();
    if (waiting) toasts = [waiting, ...toasts];
  }

  let timer: ReturnType<typeof setInterval>;
  onMount(() => {
    timer = setInterval(() => {
      const pauses = duration !== "A";
      if (pauses && paused) return;
      for (const t of toasts) {
        if (t.left === Infinity) continue;
        t.left -= 100;
        if (t.left <= 0) remove(t.id);
      }
    }, 100);
  });
  onDestroy(() => clearInterval(timer));

  function onkeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && dismissal === "A" && toasts[0])
      remove(toasts[0].id);
  }

  // Newest nearest the edge: at the top for top placements, else the bottom.
  const atBottom = $derived(placement === "B");
  const region = $derived(
    {
      A: "fixed top-4 right-4 left-4 sm:left-auto sm:w-96",
      B: "fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:w-96 sm:-translate-x-1/2",
      C: "fixed bottom-4 left-4 right-4 sm:bottom-auto sm:top-4 sm:left-auto sm:w-96",
    }[placement],
  );
  const flow = $derived(
    { A: "flex-col", B: "flex-col-reverse", C: "flex-col-reverse sm:flex-col" }[
      placement
    ],
  );
  const pile = $derived(stacking === "B" && !expanded);

  const option = (on: boolean) => [
    "min-h-11 rounded-md border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    on
      ? "border-primary bg-primary font-semibold text-primary-foreground"
      : "border-border bg-card text-foreground",
  ];
  const levelButton =
    "min-h-11 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
</script>

<svelte:window {onkeydown} />

{#snippet bar(
  name: string,
  options: Option[],
  value: string,
  set: (v: string) => void,
)}
  <fieldset class="space-y-2">
    <legend class="mb-1 font-semibold text-foreground">{name}</legend>
    <div class="flex flex-wrap gap-2">
      {#each options as o (o.id)}
        <button
          type="button"
          class={option(value === o.id)}
          aria-pressed={value === o.id}
          onclick={() => set(o.id)}
        >
          {o.label}
        </button>
      {/each}
    </div>
    <p class="text-sm text-muted-foreground">
      {options.find((o) => o.id === value)?.note}
    </p>
  </fieldset>
{/snippet}

<div class="space-y-5 rounded-lg border border-border bg-card p-4">
  {@render bar(
    "Where it appears",
    placements,
    placement,
    (v) => (placement = v),
  )}
  {@render bar("How long it stays", durations, duration, (v) => (duration = v))}
  {@render bar(
    "Can it be dismissed",
    dismissals,
    dismissal,
    (v) => (dismissal = v),
  )}
  {@render bar("How several stack", stackings, stacking, (v) => (stacking = v))}
  {@render bar(
    "Toast scheme (not a choice: the page here is light)",
    [
      { id: "light", label: "Light", note: "Toasts in light." },
      { id: "dark", label: "Dark", note: "Toasts in dark, as on a dark page." },
    ],
    scheme,
    (v) => (scheme = v as "light" | "dark"),
  )}

  <div>
    <p class="mb-2 font-semibold text-foreground">Raise a toast</p>
    <div class="flex flex-wrap gap-2">
      {#each levels as level (level)}
        <button type="button" class={levelButton} onclick={() => raise(level)}>
          <span class={["inline-flex items-center gap-2"]}>
            <span class={text[level]}><Icon path={icon(level)} /></span>
            {spoken[level]}
          </span>
        </button>
      {/each}
      <button
        type="button"
        class={levelButton}
        onclick={() => levels.forEach((l) => raise(l))}
      >
        All four
      </button>
    </div>
  </div>

  <div>
    <p class="font-semibold text-foreground">
      Announced (what a screen reader hears)
    </p>
    <ol class="mt-1 font-mono text-xs text-muted-foreground">
      {#each log as line, i (i)}
        <li>{line}</li>
      {:else}
        <li>Nothing yet.</li>
      {/each}
    </ol>
    <p class="mt-1 text-xs text-muted-foreground">
      Danger goes to an assertive region (role="alert"), the rest to a polite
      one (role="status"). Both are on the page from load; the toasts themselves
      aren't live, so nothing is read twice.
    </p>
  </div>
</div>

<!-- Live regions, empty until a toast is raised. -->
<div class="sr-only" role="status" aria-live="polite">
  {#each polite as line, i (i)}<p>{line}</p>{/each}
</div>
<div class="sr-only" role="alert" aria-live="assertive">
  {#each assertive as line, i (i)}<p>{line}</p>{/each}
</div>

<section
  aria-label="Notifications"
  data-theme={scheme === "dark" ? "dark" : undefined}
  class={[region, "z-50"]}
  onpointerenter={() => ((paused = true), (expanded = true))}
  onpointerleave={() => ((paused = false), (expanded = false))}
  onfocusin={() => ((paused = true), (expanded = true))}
  onfocusout={() => ((paused = false), (expanded = false))}
>
  <ol class={pile ? "grid" : ["flex gap-2", flow]}>
    {#each toasts as t, i (t.id)}
      <li
        class={[
          "relative flex gap-3 overflow-hidden rounded-lg border border-border border-l-4 bg-card px-4 py-3 text-sm shadow-lg transition-transform",
          {
            info: "border-l-info",
            success: "border-l-success",
            caution: "border-l-warning",
            danger: "border-l-destructive",
          }[t.level],
          pile && "col-start-1 row-start-1",
          pile && i > 2 && "invisible",
        ]}
        style={pile
          ? `z-index:${toasts.length - i};transform:translateY(${(atBottom ? -1 : 1) * i * 10}px) scale(${1 - i * 0.05})`
          : ""}
      >
        <span class={["mt-0.5 shrink-0", text[t.level]]}
          ><Icon path={icon(t.level)} /></span
        >
        <p class="min-w-0 flex-1 text-foreground-soft">
          <span class="font-semibold text-foreground">{spoken[t.level]}:</span>
          {t.message}
        </p>
        {#if dismissal === "A"}
          <button
            type="button"
            class="-my-2 -mr-3 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Dismiss: {t.message}"
            onclick={() => remove(t.id)}
          >
            <Icon path={mdiClose} />
          </button>
        {/if}
        {#if t.total !== Infinity}
          <span
            class={["absolute bottom-0 left-0 h-0.5 bg-current", text[t.level]]}
            style="width:{(100 * t.left) / t.total}%"
            aria-hidden="true"
          ></span>
        {/if}
      </li>
    {/each}
  </ol>
</section>
