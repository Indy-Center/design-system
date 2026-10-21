// What StarRating and StarDisplay share: the five stars, and a rating in words.

/** The stars, 1 to 5. */
export const STARS = [1, 2, 3, 4, 5] as const;

/** A rating as words: "4 out of 5", "4.5 out of 5". */
export function starsInWords(value: number) {
  return `${value} out of ${STARS.length}`;
}
