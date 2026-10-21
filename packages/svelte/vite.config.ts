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

export default defineConfig({
  plugins: [tailwindcss(), await sveltekit()],
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
          include: ["src/lib/**/*.test.ts", "test/**/*.browser.test.ts"],
          exclude: [...configDefaults.exclude, "src/lib/**/*.node.test.ts"],
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
        // (`*.node.test.ts`, beside them) and the built package.
        extends: true,
        test: {
          name: "node",
          include: ["src/lib/**/*.node.test.ts", "test/**/*.test.ts"],
          exclude: [...configDefaults.exclude, "test/**/*.browser.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
