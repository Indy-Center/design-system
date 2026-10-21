// Sample apps and navigation for the AppsMenu and AppNav playground pages
// and tests: the community site's and training's menus as the chrome
// prototype had them.
import { mdiBookOpenVariant, mdiHome, mdiMap, mdiSchool } from "@mdi/js";
import type { App } from "../lib/AppsMenu/AppsMenu.svelte";

export const apps: App[] = [
  {
    href: "https://flyindycenter.com",
    name: "Indy Center",
    description: "Events, roster, staff, feedback",
    icon: mdiHome,
  },
  {
    href: "https://training.flyindycenter.com",
    name: "Training",
    description: "Your training, sessions, certifications",
    icon: mdiSchool,
  },
  {
    href: "https://library.flyindycenter.com",
    name: "Library",
    description: "Courses for pilots and controllers",
    icon: mdiBookOpenVariant,
  },
  {
    href: "https://charts.flyindycenter.com",
    name: "Charts",
    description: "Airport charts for your session",
    icon: mdiMap,
  },
];
