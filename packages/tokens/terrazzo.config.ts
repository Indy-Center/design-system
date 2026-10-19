import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import tailwind from "@terrazzo/plugin-tailwind";

const block = (selector: string, scheme: string) => (contents: string) =>
  `${selector} {\n  color-scheme: ${scheme};\n  ${contents}\n}`;

export default defineConfig({
  tokens: ["./src/tokens.resolver.json"],
  outDir: "./dist/",
  plugins: [
    css({
      filename: "tokens.css",
      // Print the guide's hex rather than color(srgb …).
      legacyHex: true,
      // Light on the root, dark on any element in the dark scope
      // (decision 0001). Token IDs already give Tailwind's names:
      // color.card → --color-card.
      permutations: [
        { input: { theme: "light" }, prepare: block(":root", "light") },
        {
          input: { theme: "dark" },
          prepare: block('[data-theme="dark"]', "dark"),
        },
      ],
    }),
    tailwind({
      filename: "theme.css",
      // Resolved against outDir, not this file.
      template: "../src/theme.template.css",
      theme: {
        color: ["color.*"],
        font: ["font.*"],
      },
      defaultTheme: { theme: "light" },
    }),
  ],
});
