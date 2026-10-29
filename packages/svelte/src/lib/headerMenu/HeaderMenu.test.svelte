<!-- A header menu for HeaderMenu.test.ts: a "Menu" button (the header
     button's classes) whose panel holds two menu rows, "One" and the current
     "Two", then a bar link, "After", and the current "Here". -->
<script lang="ts">
  import HeaderMenu from "./HeaderMenu.svelte";
  import {
    barItem,
    currentClass,
    headerButton,
    menuRow,
  } from "./headerMenu.js";
</script>

<HeaderMenu buttonClass={headerButton} panelClass="w-56">
  {#snippet trigger(open)}Menu{open ? " (open)" : ""}{/snippet}
  <ul>
    <li><a href="#one" class={menuRow}>One</a></li>
    <li>
      <a href="#two" aria-current="page" class={[menuRow, currentClass]}>Two</a>
    </li>
  </ul>
</HeaderMenu>
<a href="#after" class={barItem}>After</a>
<a href="#here" aria-current="page" class={[barItem, currentClass]}>Here</a>
