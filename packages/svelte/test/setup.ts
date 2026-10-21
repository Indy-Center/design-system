import "./app.css";
import { beforeAll, beforeEach } from "vitest";
import { commands } from "vitest/browser";
import { movePointerAway } from "./pointer.ts";

// Every `motion-safe:` transition off, so a test reads the end state rather
// than racing the animation to it. A test of motion turns it back on.
beforeAll(() => commands.emulateReducedMotion("reduce"));

// Each test starts with the pointer off what it renders, wherever the last
// test (or file: they share one page) left it.
beforeEach(movePointerAway);
