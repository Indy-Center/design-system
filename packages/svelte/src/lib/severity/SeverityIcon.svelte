<script lang="ts">
  import Icon from "../Icon/Icon.svelte";
  import { SEVERITIES, type Severity } from "./severity.js";

  type Props = {
    /** Which level's icon, in its role's colour. */
    level: Severity;
  };

  let { level }: Props = $props();
</script>

<!-- 20px, the line's height, so each level's shape is clear. -->
<Icon path={SEVERITIES[level].icon} size={20} class={SEVERITIES[level].text} />
