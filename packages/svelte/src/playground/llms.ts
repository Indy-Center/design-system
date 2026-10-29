// The site in plain text, for agents: llms.txt indexes the pages, and
// llms-full.txt holds the home page, both packages' READMEs and every doc.
// Only the two prerendered routes import this, so no page carries it.
import homeText from "./home.md?llms";
import home from "./home.md?meta";
import tablesText from "@indy-center/centerline-tokens/tables.md?llms";
import tokensReadme from "../../../tokens/README.md?llms";
import svelteReadme from "../../README.md?llms";
import { SITE } from "./docNames.ts";
import { pages, sections, TOKENS } from "./site.ts";

const texts = import.meta.glob<string>("../lib/*/*.md", {
  query: "?llms",
  import: "default",
  eager: true,
});

/** The index: each page with its one-line summary. */
export function llmsTxt() {
  return [
    `# ${home!.title}`,
    `> ${home!.description}`,
    `The whole site in one file: ${SITE}/llms-full.txt. The rules (when to use what) are in the tech docs: https://tech.flyindycenter.com/design/.`,
    ...sections.map((section) =>
      [
        `## ${section.heading}`,
        ...section.pages.map(
          (page) => `- [${page.label}](${SITE}${page.href}): ${page.summary}`,
        ),
      ].join("\n"),
    ),
  ].join("\n\n");
}

// The tables without the notes to the brand guide's editors.
const tokensText = `# ${TOKENS.label}\n\n> ${TOKENS.summary}\n\n${tablesText
  .replace(/^<!--.*-->\n/gm, "")
  .trim()}\n`;

/** Everything: the home page, the READMEs, then each page in sidebar order. */
export function llmsFullTxt() {
  const docs = pages.map((page) =>
    page === TOKENS ? tokensText : page.doc ? texts[page.doc] : undefined,
  );
  return [homeText, tokensReadme, svelteReadme, ...docs]
    .filter(Boolean)
    .join("\n---\n\n");
}
