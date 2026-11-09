// Sample rich text for RichText's playground page. The body is
// `lesson-plan-body.json`, saved from Payload's editor (RichText's tests
// use it as it is); here its image's files, which live on the CMS, are
// drawn pictures of the same size.
import type { RichTextState, SerializedNode } from "../lib/index.ts";
import body from "./lesson-plan-body.json" with { type: "json" };

/** A runway drawn as an SVG, `width` × `height`, as a data URL. */
function runway(width: number, height: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="${width}" height="${height}"><rect width="800" height="600" fill="#4d7c0f"/><rect x="340" y="0" width="120" height="600" fill="#3f3f46"/><path d="M400 20v560" stroke="#fafafa" stroke-width="6" stroke-dasharray="40 30"/><text x="400" y="560" fill="#fafafa" font-family="sans-serif" font-size="56" text-anchor="middle">23</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The fixture with each upload's files swapped for drawings. */
function withDrawnImages(state: RichTextState): RichTextState {
  const copy = structuredClone(state);
  const visit = (nodes: SerializedNode[]) => {
    for (const node of nodes) {
      if (
        node.type === "upload" &&
        node.value &&
        typeof node.value === "object"
      ) {
        const file = node.value as {
          url?: string | null;
          width?: number | null;
          height?: number | null;
          sizes?: Record<
            string,
            {
              url?: string | null;
              width?: number | null;
              height?: number | null;
            }
          >;
        };
        if (file.width && file.height)
          file.url = runway(file.width, file.height);
        for (const size of Object.values(file.sizes ?? {})) {
          if (size.url && size.width && size.height) {
            size.url = runway(size.width, size.height);
          }
        }
      }
      if (Array.isArray(node.children))
        visit(node.children as SerializedNode[]);
    }
  };
  visit(copy.root.children);
  return copy;
}

/** The lesson plan's body, its image drawn here. */
export const lessonPlanBody = withDrawnImages(body as RichTextState);

/**
 * A body with an app's own block, `phraseology`, which the package
 * doesn't draw: the page gives it a snippet.
 */
export const phraseologyBody: RichTextState = {
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "text", text: "Clear the aircraft to land:", format: 0 },
        ],
      },
      {
        type: "block",
        fields: {
          id: "<block-id>",
          blockName: "",
          blockType: "phraseology",
          words: "N123AB, runway 23 right, cleared to land.",
        },
      },
    ],
  },
};
