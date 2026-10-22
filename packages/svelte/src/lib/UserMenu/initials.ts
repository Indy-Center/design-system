/**
 * The letters on the user menu's round button: the first letter of the
 * first and last words of the name, upper case. One word gives one letter,
 * as for a member who shows only a first name; no words, none.
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = (word: string) => Array.from(word)[0];
  const letters =
    words.length === 1
      ? first(words[0])
      : first(words[0]) + first(words[words.length - 1]);
  return letters.toUpperCase();
}
