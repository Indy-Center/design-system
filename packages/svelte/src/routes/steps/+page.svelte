<script lang="ts">
  import { Steps, type Step } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  const steps: Step[] = [
    { label: "Joined the waitlist", state: "done", date: "18 October 2026" },
    {
      label: "VATUSA Academy course passed",
      state: "done",
      date: "19 October 2026",
    },
    {
      label: "Training",
      state: "current",
      detail: "Teacher: Jo Bloggs (1234567)",
    },
    { label: "Rating exam", state: "upcoming" },
    { label: "Certification", state: "upcoming" },
  ];
</script>

<Schemes>
  <Steps {steps} aria-label="Your training request" />
</Schemes>
