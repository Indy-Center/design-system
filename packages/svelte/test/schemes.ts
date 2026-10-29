import type { ComponentProps } from "svelte";
import {
  render,
  type Component,
  type ComponentImport,
  type ComponentOptions,
} from "vitest-browser-svelte";
import { afterEach } from "vitest";

/**
 * Where a component can sit: a light page, a dark page, or the dark header
 * on a light page (the guide's framed light).
 */
export type Scheme = "light" | "dark" | "dark-header";

const targets: HTMLElement[] = [];

afterEach(() => {
  delete document.documentElement.dataset.theme;
  for (const target of targets.splice(0)) target.remove();
});

/** Renders `component` with `props` in `scheme`. */
export function renderIn<C extends Component>(
  scheme: Scheme,
  component: ComponentImport<C>,
  props: ComponentProps<C>,
) {
  if (scheme === "dark") document.documentElement.dataset.theme = "dark";
  const target = document.createElement(
    scheme === "dark-header" ? "header" : "main",
  );
  if (scheme === "dark-header") target.dataset.theme = "dark";
  document.body.append(target);
  targets.push(target);
  // The library's option types don't resolve for a generic C.
  return render(component, { props, target } as ComponentOptions<C>);
}
