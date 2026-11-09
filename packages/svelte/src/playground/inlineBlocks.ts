// A paragraph of every inline block, for RichText's playground page.
import type { RichTextState, SerializedNode } from "../lib/index.ts";

const words = (text: string): SerializedNode => ({
  type: "text",
  text,
  format: 0,
});
const inline = (blockType: string, fields: object): SerializedNode => ({
  type: "inlineBlock",
  fields: { id: "<block-id>", blockType, ...fields },
});

/** A sentence with a position, frequency, airport, rating, category and time. */
export const inlineBlocksBody: RichTextState = {
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          words("When "),
          inline("position", { callsign: "IND_GND", show: null }),
          words(" is closed, use "),
          inline("frequency", { callsign: "IND_83_CTR" }),
          words(" or "),
          inline("frequency", { value: "121.9" }),
          words(" at "),
          inline("airport", {
            airport: { code: "KIND", name: "Indianapolis International" },
          }),
          words(". An "),
          inline("rating", { rating: "S3", kind: "controller" }),
          words(" may work it in "),
          inline("flightCategory", { category: "MVFR" }),
          words(" or "),
          inline("flightCategory", { category: "IFR" }),
          words(" weather, "),
          inline("time", { value: "2300", end: "0300" }),
          words(" daily. The "),
          inline("position", { callsign: "XYZ_APP" }),
          words(" position is not in the app's data. "),
          inline("position", {
            callsign: "LEX_TWR",
            show: ["radioName", "airport"],
            airportAt: "under",
            airport: { code: "KLEX", name: "Blue Grass" },
          }),
          words(" shows its airport, and "),
          inline("position", {
            callsign: "IND_TWR",
            show: ["airport"],
            airport: {},
          }),
          words(" has none."),
        ],
      },
    ],
  },
};
