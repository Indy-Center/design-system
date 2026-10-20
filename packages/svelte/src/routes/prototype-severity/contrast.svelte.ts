// Throwaway: measures an element's colour against what is really behind it,
// by painting the ancestors' backgrounds, then the colour, on a 1px canvas.

let ctx: CanvasRenderingContext2D | null = null;

function context() {
  if (!ctx) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    ctx = canvas.getContext("2d", { willReadFrequently: true });
  }
  return ctx!;
}

function alphaOf(css: string) {
  const c = context();
  c.clearRect(0, 0, 1, 1);
  c.fillStyle = css;
  c.fillRect(0, 0, 1, 1);
  return c.getImageData(0, 0, 1, 1).data[3];
}

// The opaque colour the element's own colour is drawn on, then that colour.
function paint(el: Element): [number[], number[]] {
  const layers: string[] = [];
  for (let node: Element | null = el; node; node = node.parentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    if (alphaOf(bg) === 0) continue;
    layers.push(bg);
    if (alphaOf(bg) === 255) break;
  }
  const c = context();
  c.clearRect(0, 0, 1, 1);
  c.fillStyle = "#fff";
  c.fillRect(0, 0, 1, 1);
  for (const layer of layers.reverse()) {
    c.fillStyle = layer;
    c.fillRect(0, 0, 1, 1);
  }
  const bg = [...c.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  c.fillStyle = getComputedStyle(el).color;
  c.fillRect(0, 0, 1, 1);
  const fg = [...c.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  return [fg, bg];
}

function luminance([r, g, b]: number[]) {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const hex = (rgb: number[]) =>
  "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");

export type Measure = { ratio: number; fg: string; bg: string };

export function measure(el: Element): Measure {
  const [fg, bg] = paint(el);
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return { ratio: (a + 0.05) / (b + 0.05), fg: hex(fg), bg: hex(bg) };
}

// Which panel of <Schemes> the element is in.
export function schemeOf(el: Element) {
  if (el.closest("header[data-theme=dark]")) return "dark-header";
  if (el.closest("[data-theme=dark]")) return "dark";
  return "light";
}

// Every measured specimen, keyed "style/level/scheme", for the summary table.
export const results: Record<string, { text: Measure; icon: Measure }> = $state(
  {},
);
