// The Markdown plugin's imports (markdown.ts).
declare module "*.md?meta" {
  const meta: import("./markdown.ts").DocMeta | undefined;
  export default meta;
}

declare module "*.md?html" {
  const doc: import("./markdown.ts").Doc;
  export default doc;
}

declare module "*.md?llms" {
  const text: string;
  export default text;
}

declare module "*.md?tables" {
  const tables: import("./markdown.ts").DocTable[];
  export default tables;
}
