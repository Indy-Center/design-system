import adapter from "@sveltejs/adapter-cloudflare";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";
import {
  emulateColorScheme,
  emulateReducedMotion,
  emulateTimeZone,
  serverRender,
  storedCookies,
} from "./test/commands.ts";
import { markdown } from "./src/playground/markdown.ts";

export default defineConfig({
  // The adapter builds the playground as a Worker (`npm run
  // build:playground`); svelte-package, which builds the published
  // components, ignores it. `markdown` draws the docs for the playground,
  // at build: nothing it uses reaches the Worker or the package.
  plugins: [markdown(), tailwindcss(), await sveltekit({ adapter: adapter() })],
  // The tokens package is linked from beside this one; its font is served
  // from there.
  server: { fs: { allow: ["../tokens"] } },
  // For any server render here (the tests' inlines dependencies; the
  // playground's), take a package's ES module (`@mdi/js`'s) over its
  // CommonJS `main`, which can't run inlined.
  ssr: { resolve: { mainFields: ["module", "main"] } },
  // The dependencies the components and their tests load that the Svelte
  // plugins don't list, bundled before the first test file loads. Found
  // mid-run instead, on a cold cache, Vite re-bundles and reloads the
  // browser, and the files already loading fail to import.
  optimizeDeps: {
    include: [
      "@mdi/js",
      "esm-env",
      "@sveltejs/kit > devalue",
      "vitest-browser-svelte",
    ],
  },
  test: {
    // expect.element retries until the test times out, so keep this short.
    testTimeout: 10_000,
    projects: [
      {
        // Component tests, beside each component, in headless Chromium,
        // and the test helpers' checks that need a page.
        extends: true,
        test: {
          name: "components",
          include: [
            "src/lib/**/*.test.ts",
            "src/playground/**/*.test.ts",
            "test/**/*.browser.test.ts",
          ],
          exclude: [...configDefaults.exclude, "src/**/*.node.test.ts"],
          setupFiles: ["test/setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              // A browser already on the machine, when Playwright's own
              // revision isn't installed (see the README).
              launchOptions: {
                executablePath: process.env.CHROMIUM_PATH || undefined,
              },
            }),
            instances: [{ browser: "chromium" }],
            commands: {
              emulateColorScheme,
              emulateReducedMotion,
              emulateTimeZone,
              serverRender,
              storedCookies,
            },
          },
        },
      },
      {
        // Tests that need no browser, in Node: pure modules
        // (`*.node.test.ts`, beside them; the site's llms files) and the
        // built package.
        extends: true,
        test: {
          name: "node",
          include: ["src/**/*.node.test.ts", "test/**/*.test.ts"],
          exclude: [...configDefaults.exclude, "test/**/*.browser.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
