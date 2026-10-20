// The table's look, written as selectors on the <table> itself so plain
// HTML rows get it too: a rich-text table from the CMS can reuse these
// classes later.
export const tableClasses = [
  "w-full border-collapse bg-card text-left text-sm",
  // A hidden caption (sr-only) keeps its zero padding.
  "[&_caption:not(.sr-only)]:px-4 [&_caption:not(.sr-only)]:py-3 [&_caption]:text-left [&_caption]:font-heading [&_caption]:text-base [&_caption]:font-semibold [&_caption]:text-foreground",
  "[&_thead]:bg-muted",
  "[&_th]:px-4 [&_th]:py-2 [&_th]:align-bottom [&_th]:font-semibold [&_th]:text-foreground",
  "[&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_td]:text-foreground-soft",
  "[&_tbody_th]:py-3 [&_tbody_th]:align-top [&_tbody_th]:font-medium",
  "[&_tr]:border-t [&_tr]:border-border [&_thead_tr:first-child]:border-t-0",
];

// The scrolling region around it: a keyboard focuses it to scroll. Its
// width comes from its container, never the table, so a wide table
// scrolls here instead of widening a page's grid or flex column.
export const tableRegionClasses = [
  "overflow-x-auto [contain:inline-size] rounded-lg border border-border",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
];
