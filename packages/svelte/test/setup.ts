import "./app.css";
import { beforeAll, beforeEach } from "vitest";
import { commands, server, userEvent } from "vitest/browser";
import { movePointerAway } from "./pointer.ts";

// On a Mac, Tab reaches only text fields unless the member turns on
// keyboard navigation; Option-Tab reaches every control and link. The
// tests' Tab is a keyboard user's, so in WebKit it holds Option.
if (server.browser === "webkit") {
  userEvent.tab = ({ shift = false } = {}) =>
    userEvent.keyboard(
      shift ? "{Shift>}{Alt>}{Tab}{/Alt}{/Shift}" : "{Alt>}{Tab}{/Alt}",
    );
}

// Every `motion-safe:` transition off, so a test reads the end state rather
// than racing the animation to it. A test of motion turns it back on.
beforeAll(() => commands.emulateReducedMotion("reduce"));

// Each test starts with the pointer off what it renders, wherever the last
// test (or file: they share one page) left it.
beforeEach(movePointerAway);
