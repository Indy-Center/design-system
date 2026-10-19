import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tailwindcss(), await sveltekit()],
  test: {
    // expect.element retries until the test times out, so keep this short.
    testTimeout: 10_000,
    projects: [
      {
        // Component tests, beside each component, in headless Chromium.
        extends: true,
        test: {
          name: "components",
          include: ["src/lib/**/*.test.ts"],
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
          },
        },
      },
      {
        // Tests of the built package, in Node.
        extends: true,
        test: {
          name: "package",
          include: ["test/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
