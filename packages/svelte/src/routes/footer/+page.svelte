<script lang="ts">
  // The footer is a full-width band and the same in both schemes, so it is
  // shown full width on a light page and on a dark page, rather than in the
  // three narrow columns of <Schemes>.
  import { Footer, type FooterColumn } from "../../lib/index.ts";

  // Placeholders for the shape: the real links wait on the policy pages.
  const columns: FooterColumn[] = [
    {
      heading: "Apps",
      links: [
        { href: "https://flyindycenter.com", label: "Community" },
        { href: "https://training.flyindycenter.com", label: "Training" },
        { href: "https://library.flyindycenter.com", label: "Library" },
      ],
    },
    {
      heading: "Help",
      links: [
        { href: "#contact", label: "Contact us" },
        { href: "#staff", label: "Staff" },
        { href: "https://discord.indy.center", label: "Discord" },
      ],
    },
    {
      heading: "Policies",
      links: [
        { href: "#privacy", label: "Privacy policy" },
        { href: "#accessibility", label: "Accessibility statement" },
      ],
    },
  ];

  const label =
    "mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase";
</script>

<div class="grid gap-4">
  <section class="rounded-lg border border-border bg-background p-4">
    <h2 class={label}>Light page</h2>
    <Footer {columns} />
  </section>

  <section
    data-theme="dark"
    class="rounded-lg border border-border bg-background p-4"
  >
    <h2 class={label}>Dark page</h2>
    <Footer {columns} label="Indy Center" />
  </section>
</div>
