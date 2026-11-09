import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Citation from "./Citation.svelte";
import CitationInSentence from "./Citation.test.svelte";

const order = {
  name: "JO 7110.65",
  edition: "BB",
  url: "https://www.faa.gov/air_traffic/publications/atpubs/atc_html/",
};

describe("Citation", () => {
  test("in a sentence: the source in a cite, the place a link to its page", async () => {
    const screen = await renderIn("light", CitationInSentence, {
      source: order,
      at: "3-9-6",
    });
    await expect
      .element(screen.getByText(/^Hold departures behind a heavy, per/))
      .toBeVisible();
    await expect
      .element(screen.getByText("JO 7110.65 BB"))
      .toHaveProperty("tagName", "CITE");
    const link = screen.getByRole("link", { name: "3-9-6" });
    await expect.element(link).toHaveAttribute("href", order.url);
    await expect.element(link).toHaveStyle({ color: role("link", "light") });
  });

  test("with a file and no address, the place links to the file", async () => {
    const screen = await renderIn("light", Citation, {
      source: {
        name: "Indy Center SOP",
        edition: "Rev 2",
        file: { url: "/files/sop.pdf" },
      },
      at: "Chapter 4",
    });
    await expect
      .element(screen.getByText("Indy Center SOP Rev 2"))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: "Chapter 4" }))
      .toHaveAttribute("href", "/files/sop.pdf");
  });

  test("the address wins over the file", async () => {
    const screen = await renderIn("light", Citation, {
      source: { ...order, file: { url: "/files/order.pdf" } },
      at: "3-9-6",
    });
    await expect
      .element(screen.getByRole("link", { name: "3-9-6" }))
      .toHaveAttribute("href", order.url);
  });

  test("with neither, the place is plain text", async () => {
    const screen = await renderIn("light", Citation, {
      source: { name: "Controller notes" },
      at: "Appendix B",
    });
    await expect
      .element(screen.getByText(/Appendix B/))
      .toHaveTextContent("Controller notes Appendix B");
    await expect.element(screen.getByRole("link")).not.toBeInTheDocument();
  });

  test("with no place, only the source, and no link", async () => {
    const screen = await renderIn("light", Citation, { source: order });
    await expect.element(screen.getByText("JO 7110.65 BB")).toBeVisible();
    await expect.element(screen.getByRole("link")).not.toBeInTheDocument();
  });

  test("adds a caller's class and attributes to the outer span", async () => {
    const screen = await renderIn("light", Citation, {
      source: order,
      at: "3-9-6",
      class: "ml-4",
      "data-x": "1",
    });
    const cite = screen.getByText("JO 7110.65 BB").element();
    const span = cite.parentElement!;
    expect(span.tagName).toBe("SPAN");
    expect(span).toHaveClass("ml-4");
    expect(span).toHaveAttribute("data-x", "1");
  });
});
