import { describe, expect, test } from "vitest";
import { type Locator, userEvent } from "vitest/browser";
import { contrastOn, SURFACES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import StarRating from "./StarRating.svelte";

/** A radio's star: the label round it, the 44px target a member clicks. */
const starOf = (radio: Locator) => radio.element().closest("label")!;

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
    await userEvent.click(starOf(four));
    await expect.element(four).toBeChecked();
    expect(value).toBe(4);
  });

  test("shows the value in words, and previews the star under the pointer", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      value: 2,
    });
    const five = starOf(screen.getByRole("radio", { name: "5 stars" }));
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

  test("checks the radio for the value it's given; Tab enters there, and the arrow keys move and choose", async () => {
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
    await expect.element(radio("3 stars")).toBeChecked();
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

  test("shows a star chosen by keyboard, though the pointer rests on another", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      value: 3,
    });
    const radio = (name: string) => screen.getByRole("radio", { name });
    await userEvent.hover(starOf(radio("5 stars")));
    await expect.element(screen.getByText("5 out of 5")).toBeVisible();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(radio("2 stars")).toBeChecked();
    await expect.element(screen.getByText("2 out of 5")).toBeVisible();
  });

  // The guide's roles: chosen stars in `warning`, the rest in
  // `muted-foreground`. Both are 3:1 or more on the page and on a card
  // (WCAG 1.4.11, non-text contrast).
  test("colours the chosen stars and the rest", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      value: 3,
    });
    const star = (name: string) => starOf(screen.getByRole("radio", { name }));
    await expect
      .element(star("3 stars"))
      .toHaveStyle({ color: role("warning", "light") });
    await expect
      .element(star("4 stars"))
      .toHaveStyle({ color: role("muted-foreground", "light") });
    for (const name of ["3 stars", "4 stars"]) {
      for (const surface of Object.values(SURFACES.light)) {
        expect(contrastOn(star(name), surface)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  // The guide's `ring` role, round the star's 44px target.
  test("rings the focused star", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
    });
    await userEvent.tab();
    const label = starOf(screen.getByRole("radio", { name: "1 star" }));
    await expect.element(label).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
    const { width, height } = label.getBoundingClientRect();
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  });

  // Fieldset's wiring, which Fieldset's tests hold.
  test("required, says so by the legend and requires a choice; described by its hint and error, with attributes on the fieldset", async () => {
    const screen = await renderIn("light", StarRating, {
      legend: "Rating",
      name: "rating",
      required: true,
      hint: "Only training staff see it.",
      error: "Choose a rating.",
      id: "teacher-rating",
    });
    const group = screen.getByRole("group", { name: "Rating (required)" });
    await expect
      .element(group)
      .toHaveAccessibleDescription(
        "Only training staff see it. Choose a rating.",
      );
    await expect.element(group).toHaveAttribute("id", "teacher-rating");
    await expect
      .element(screen.getByRole("radio", { name: "1 star" }))
      .toBeRequired();
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
