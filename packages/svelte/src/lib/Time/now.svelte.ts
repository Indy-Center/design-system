import { createSubscriber } from "svelte/reactivity";

// One timer for every `Time` on the page, running only while something
// reads the time, and firing as each minute turns.
const subscribe = createSubscriber((update) => {
  let timer: ReturnType<typeof setTimeout>;
  const next = () => {
    timer = setTimeout(
      () => {
        update();
        next();
      },
      60_000 - (Date.now() % 60_000),
    );
  };
  next();
  return () => clearTimeout(timer);
});

/** The time now; reading it in an effect or template redraws each minute. */
export function now(): Date {
  subscribe();
  return new Date();
}
