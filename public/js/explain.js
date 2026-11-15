// Explanations on touch screens. Phones don't show tooltips, so on a touch
// screen tapping a term (a Roman numeral, a degree under the chosen chord,
// a dot on the guitar ...) shows its tooltip in a panel at the bottom of
// the page, and holding a button (a chord, a key signature ...) for half a
// second does the same without pressing it. A mouse is left alone and gets
// the usual tooltips.
//
// The text comes from the title attributes (and SVG <title>s) that render()
// already fills in, so all the wording stays in tooltips.js.

import * as state from "./state.js";

// How far (in screen pixels) a finger may move and still count as a tap, as in drag.js.
const TAP_TOLERANCE = 4;
// How long to hold a button to read its explanation, in milliseconds.
const HOLD_TIME = 500;

// The tooltip of an element or the nearest element around it that has one,
// or null: tapping the "7" under a G7 chord finds the tooltip on its tile.
function tipFor(element) {
  for (let el = element; el && el !== document.body; el = el.parentElement) {
    // The theme button's tooltip only repeats what it does.
    if (el.id === "theme-toggle") return null;
    if (el instanceof SVGElement) {
      const title = [...el.children].find((child) => child.tagName === "title");
      if (title) return title.textContent;
    } else if (el.title) {
      return el.title;
    }
  }
  return null;
}

// Wire up the touch handling. `sheet` is the panel, `closeButton` closes
// it, and `onChange` redraws the page after the explanation changes.
export function initExplain({ sheet, closeButton, onChange }) {
  const show = (text) => {
    if (text === state.explanation()) return;
    state.setExplanation(text);
    onChange();
  };

  // The finger that's down: { x, y, target, button, moved, timer }.
  let press = null;
  // Set when holding a button showed its explanation, so letting go
  // doesn't also press it.
  let swallowClick = false;

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || !event.isPrimary) return;
    swallowClick = false;
    const button = event.target.closest("button");
    press = { x: event.clientX, y: event.clientY, target: event.target, button, moved: false, timer: null };
    if (button && !sheet.contains(button)) {
      const text = tipFor(button);
      if (text) {
        press.timer = setTimeout(() => {
          swallowClick = true;
          show(text);
        }, HOLD_TIME);
      }
    }
  });

  document.addEventListener("pointermove", (event) => {
    if (!press || !event.isPrimary) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > TAP_TOLERANCE) {
      press.moved = true;
      clearTimeout(press.timer);
    }
  });

  // A tap anywhere but a button or the panel shows that spot's explanation,
  // or closes the panel if there isn't one (on a ring, say).
  document.addEventListener("pointerup", (event) => {
    if (!press || !event.isPrimary) return;
    const { target, button, moved, timer } = press;
    clearTimeout(timer);
    press = null;
    if (!moved && !button && !sheet.contains(target)) show(tipFor(target));
  });

  document.addEventListener("pointercancel", () => {
    if (press) clearTimeout(press.timer);
    press = null;
  });

  // Runs before the button's own click handler, so it can stop it.
  document.addEventListener("click", (event) => {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  // Holding a button would otherwise open the phone's own menu.
  document.addEventListener("contextmenu", (event) => {
    if (press?.button) event.preventDefault();
  });

  closeButton.addEventListener("click", () => show(null));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") show(null);
  });
}
