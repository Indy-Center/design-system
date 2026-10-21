// What StarRating and StarDisplay share: the five stars, how each is drawn,
// and the words for them.
import { mdiStar, mdiStarHalfFull, mdiStarOutline } from "@mdi/js";

/** The stars, 1 to 5. */
export const STARS = [1, 2, 3, 4, 5] as const;

/** A rating as words: "4 out of 5", "4.5 out of 5". */
export function starsInWords(value: number) {
  return `${value} out of ${STARS.length}`;
}

/** A star's radio name: "1 star", "2 stars". */
export function starLabel(star: number) {
  return star === 1 ? "1 star" : `${star} stars`;
}

/**
 * How `star` is drawn for a rating of `value` (whole or half): filled,
 * half or outline, and lit (`warning`) unless it's an outline.
 */
export function starLook(star: number, value: number) {
  if (star <= value) return { path: mdiStar, colour: "text-warning" };
  if (star - 0.5 === value) {
    return { path: mdiStarHalfFull, colour: "text-warning" };
  }
  return { path: mdiStarOutline, colour: "text-muted-foreground" };
}
