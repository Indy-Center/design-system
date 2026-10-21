// Sample apps and navigation for the AppsMenu and AppNav playground pages
// and tests: the community site's and training's menus as the chrome
// prototype had them.
import {
  mdiAccountGroup,
  mdiAccountPlus,
  mdiAirplane,
  mdiBadgeAccountHorizontal,
  mdiBookOpenVariant,
  mdiCalendar,
  mdiEmailOutline,
  mdiHandshake,
  mdiHeadset,
  mdiHome,
  mdiInformationOutline,
  mdiMap,
  mdiMessage,
  mdiSchool,
} from "@mdi/js";
import type { App } from "../lib/AppsMenu/AppsMenu.svelte";
import type { NavItem } from "../lib/AppNav/AppNav.svelte";

export const apps: App[] = [
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

/** The community site's navigation. */
export const hubNav: NavItem[] = [
  { label: "Home", href: "/", icon: mdiHome },
  { label: "Events", href: "/events", icon: mdiCalendar },
  {
    label: "Controlling",
    icon: mdiHeadset,
    children: [
      { label: "Roster", href: "/roster", icon: mdiAccountGroup },
      { label: "Join Indy Center", href: "/visit", icon: mdiAccountPlus },
    ],
  },
  {
    label: "Flying",
    icon: mdiAirplane,
    children: [{ label: "Feedback", href: "/feedback", icon: mdiMessage }],
  },
  {
    label: "About",
    icon: mdiInformationOutline,
    children: [
      { label: "Staff", href: "/staff", icon: mdiBadgeAccountHorizontal },
      { label: "Partners", href: "/partners", icon: mdiHandshake },
      { label: "Contact Us", href: "/contact", icon: mdiEmailOutline },
    ],
  },
];
