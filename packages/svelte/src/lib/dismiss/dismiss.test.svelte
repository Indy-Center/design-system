<!-- A disclosure for dismiss.test.ts: a button, its panel, and a button
     elsewhere on the page. With `nested`, the panel holds a second
     disclosure, as a menu can hold a tooltip; with `beside`, a separate
     one follows, as a tooltip hovered elsewhere on the page. -->
<script lang="ts">
  import { dismiss } from "./dismiss.js";

  type Props = {
    /** Whether the panel starts open. */
    open?: boolean;
    /** Puts a second disclosure, "More", inside the panel. */
    nested?: boolean;
    /** Puts a separate disclosure, "Help", after the page's buttons. */
    beside?: boolean;
  };

  let { open = false, nested = false, beside = false }: Props = $props();
  let besideOpen = $state(false);
  let besideTrigger = $state<HTMLButtonElement>();
  let trigger = $state<HTMLButtonElement>();
  let innerOpen = $state(false);
  let innerTrigger = $state<HTMLButtonElement>();
</script>

<button
  bind:this={trigger}
  type="button"
  aria-expanded={open}
  aria-controls="panel"
  onclick={() => (open = !open)}>Apps</button
>
<div
  id="panel"
  hidden={!open}
  use:dismiss={{ open, trigger, onclose: () => (open = false) }}
>
  <button type="button">Inside</button>
  <p>Some text</p>
  {#if nested}
    <button
      bind:this={innerTrigger}
      type="button"
      aria-expanded={innerOpen}
      aria-controls="inner-panel"
      onclick={() => (innerOpen = !innerOpen)}>More</button
    >
    <div
      id="inner-panel"
      hidden={!innerOpen}
      use:dismiss={{
        open: innerOpen,
        trigger: innerTrigger,
        onclose: () => (innerOpen = false),
      }}
    >
      <button type="button">Deeper</button>
    </div>
  {/if}
</div>
<button type="button">Elsewhere</button>
{#if beside}
  <button
    bind:this={besideTrigger}
    type="button"
    aria-expanded={besideOpen}
    aria-controls="beside-panel"
    onclick={() => (besideOpen = !besideOpen)}>Help</button
  >
  <div
    id="beside-panel"
    hidden={!besideOpen}
    use:dismiss={{
      open: besideOpen,
      trigger: besideTrigger,
      onclose: () => (besideOpen = false),
    }}
  >
    <p>Some help</p>
  </div>
{/if}
