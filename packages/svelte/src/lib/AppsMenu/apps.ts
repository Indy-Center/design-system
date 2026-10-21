import { mdiBookOpenVariant, mdiHome, mdiMap, mdiSchool } from "@mdi/js";
import type { App } from "./AppsMenu.svelte";

/**
 * Every Indy Center app, in the order the Apps menu lists them, for
 * `AppsMenu`'s `apps`. An app with its own list passes that instead.
 */
export const INDY_CENTER_APPS: readonly App[] = [
  {
    href: "https://flyindycenter.com",
    label: "Indy Center",
    description: "Events, roster, staff, feedback",
    icon: mdiHome,
  },
  {
    href: "https://training.flyindycenter.com",
    label: "Training",
    description: "Your training, sessions, certifications",
    icon: mdiSchool,
  },
  {
    href: "https://library.flyindycenter.com",
    label: "Library",
    description: "Courses for pilots and controllers",
    icon: mdiBookOpenVariant,
  },
  {
    href: "https://charts.flyindycenter.com",
    label: "Charts",
    description: "Airport charts for your session",
    icon: mdiMap,
  },
];
