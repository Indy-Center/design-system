import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import StarRating from "./StarRating.svelte";

describe("StarRating", () => {
  test("is a group named by its legend, with a radio for each of five stars", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "How was your session?",
      name: "rating",
    });
    const group = screen.getByRole("group", { name: "How was your session?" });
    expect(group.getByRole("radio").elements()).toHaveLength(5);
    for (const name of ["1 star", "2 stars", "3 stars", "4 stars", "5 stars"]) {
      await expect
        .element(group.getByRole("radio", { name }))
        .toBeInTheDocument();
    }
    await expect
      .element(group.getByRole("radio", { name: "4 stars" }))
      .toHaveAttribute("value", "4");
  });

  test("sets the value to the stars chosen, and checks that radio", async () => {
    let value: number | undefined;
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      get value() {
        return value;
      },
      set value(next) {
        value = next;
      },
    });
    const four = screen.getByRole("radio", { name: "4 stars" });
    // A member clicks the star, the label round the hidden radio.
    await userEvent.click(four.element().closest("label")!);
    await expect.element(four).toBeChecked();
    expect(value).toBe(4);
  });

  test("checks the radio for the value it's given", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      value: 2,
    });
    await expect
      .element(screen.getByRole("radio", { name: "2 stars" }))
      .toBeChecked();
  });

  test("shows the value in words, and previews the star under the pointer", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      value: 2,
    });
    const five = screen
      .getByRole("radio", { name: "5 stars" })
      .element()
      .closest("label")!;
    await expect.element(screen.getByText("2 out of 5")).toBeVisible();
    await userEvent.hover(five);
    await expect.element(screen.getByText("5 out of 5")).toBeVisible();
    await expect.element(five).toHaveStyle({ color: role("warning", "light") });
    await userEvent.hover(screen.getByText("Rating"));
    await expect.element(screen.getByText("2 out of 5")).toBeVisible();
    await expect
      .element(five)
      .toHaveStyle({ color: role("muted-foreground", "light") });
  });

  test("says Not rated while no star is chosen", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
    });
    await expect.element(screen.getByText("Not rated")).toBeVisible();
  });

  test("Tab enters at the chosen star; the arrow keys move and choose", async () => {
    let value: number | undefined = 3;
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      get value() {
        return value;
      },
      set value(next) {
        value = next;
      },
    });
    const radio = (name: string) => screen.getByRole("radio", { name });
    await userEvent.tab();
    await expect.element(radio("3 stars")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(radio("4 stars")).toHaveFocus();
    await expect.element(radio("4 stars")).toBeChecked();
    expect(value).toBe(4);
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect.element(radio("2 stars")).toBeChecked();
    expect(value).toBe(2);
  });

  // The guide's roles: chosen stars in `warning`, the rest in
  // `muted-foreground`.
  test.each(SCHEMES)(
    "colours the chosen stars and the rest in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, StarRating, {
        legend: "Rating",
        name: "rating",
        value: 3,
      });
      const star = (name: string) =>
        screen.getByRole("radio", { name }).element().closest("label")!;
      await expect
        .element(star("3 stars"))
        .toHaveStyle({ color: role("warning", scheme) });
      await expect
        .element(star("4 stars"))
        .toHaveStyle({ color: role("muted-foreground", scheme) });
    },
  );

  // The guide's `ring` role, round the star's 44px target.
  test.each(SCHEMES)("rings the focused star in %s", async (scheme) => {
    const screen = await renderIn(scheme, StarRating, {
      legend: "Rating",
      name: "rating",
    });
    await userEvent.tab();
    const label = screen
      .getByRole("radio", { name: "1 star" })
      .element()
      .closest("label")!;
    await expect.element(label).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", scheme),
    });
    const { width, height } = label.getBoundingClientRect();
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  });

  test("required, says so by the legend and requires a choice", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      required: true,
    });
    await expect
      .element(screen.getByRole("group", { name: "Rating (required)" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("radio", { name: "1 star" }))
      .toBeRequired();
  });

  test("describes the group by its hint and error, and passes attributes to the fieldset", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      hint: "Only training staff see it.",
      error: "Choose a rating.",
      id: "teacher-rating",
    });
    const group = screen.getByRole("group", { name: "Rating" });
    await expect
      .element(group)
      .toHaveAccessibleDescription(
        "Only training staff see it. Choose a rating.",
      );
    await expect.element(group).toHaveAttribute("id", "teacher-rating");
  });

  test("disabled, can't be chosen", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      disabled: true,
    });
    await expect
      .element(screen.getByRole("radio", { name: "5 stars" }))
      .toBeDisabled();
  });
});
