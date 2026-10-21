// Sample navigation for the AppNav and AppNavMenu playground page and
// tests: the community site's menus as the chrome prototype had them.
// AppsMenu's use the package's own INDY_CENTER_APPS.
import {
  mdiAccountGroup,
  mdiAccountPlus,
  mdiAirplane,
  mdiBadgeAccountHorizontal,
  mdiCalendar,
  mdiEmailOutline,
  mdiHandshake,
  mdiHeadset,
  mdiHome,
  mdiInformationOutline,
  mdiMessage,
} from "@mdi/js";
import type { NavItem } from "../lib/AppNav/nav.ts";

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
