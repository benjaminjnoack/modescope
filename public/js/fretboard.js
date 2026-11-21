// Draws a guitar neck lying on its side: the nut on the left, the high e
// string on top (as in guitar tab), and frets 1-12 to the right. Left of
// the nut, each string shows the note it plays and O (open) or X (muted).
//
// On a phone held upright the same drawing is turned a quarter turn
// clockwise, which makes it a chord chart: the nut on top, low E on the
// left, high e on the right. Its frets are shorter there (about as far
// apart as the strings), or the neck would be far taller than the screen.

import { FRETS, STRINGS } from "./guitar.js";
import { createSvg } from "./svg.js";
import * as tips from "./tooltips.js";

const NAME_X = 22;
const MARK_X = 54;
const NUT_X = 76;
const TOP_Y = 28;
const STRING_GAP = 26;
const DOT_RADIUS = 10;
// How far apart the frets are, lying down and standing up.
const FRET_WIDTH = { horizontal: (884 - NUT_X) / FRETS, vertical: 30 };
// The drawing's size before it's turned: room past the last fret, and
// below the low E for the fret numbers.
const END_MARGIN = 16;
const HEIGHT = 200;
const INLAYS = [3, 5, 7, 9];

// Strings are listed low E first but drawn with the high e on top.
const stringY = (string) => TOP_Y + (STRINGS.length - 1 - string) * STRING_GAP;
const BOTTOM_Y = stringY(0);
const MIDDLE_Y = (TOP_Y + BOTTOM_Y) / 2;

// Redraw the neck for one voicing from voicingsFor (or null if there is none).
// `chordName` (e.g. "G7") is used in the tooltips. `vertical` stands the
// neck up, nut on top.
export function renderFretboard(svg, voicing, chordName, { vertical = false } = {}) {
  const fretWidth = vertical ? FRET_WIDTH.vertical : FRET_WIDTH.horizontal;
  const endX = NUT_X + FRETS * fretWidth;
  // The middle of the space behind a fret, where a finger presses.
  const fretX = (fret) => NUT_X + (fret - 0.5) * fretWidth;
  const length = endX + END_MARGIN;

  // Everything is drawn lying down into `drawing`; standing up, it's turned
  // a quarter turn clockwise, so (x, y) lands at (HEIGHT - y, x).
  const drawing = vertical ? createSvg("g", { transform: `translate(${HEIGHT} 0) rotate(90)` }) : svg;
  svg.setAttribute("viewBox", vertical ? `0 0 ${HEIGHT} ${length}` : `0 0 ${length} ${HEIGHT}`);
  svg.replaceChildren(...(vertical ? [drawing] : []));
  drawing.append(...neck(endX, fretX));
  draw(drawing, voicing, chordName, fretX, endX);

  // Turn the text back so it reads the right way up.
  if (vertical) {
    for (const text of drawing.querySelectorAll("text")) {
      text.setAttribute("transform", `rotate(-90 ${text.getAttribute("x")} ${text.getAttribute("y")})`);
    }
  }
}

// The fingers, barre, thumb and string labels of a voicing.
function draw(svg, voicing, chordName, fretX, endX) {
  if (!voicing) {
    svg.append(createSvg("text", { class: "no-voicing", x: (NUT_X + endX) / 2, y: MIDDLE_Y },
      "No easy fingering for this chord"));
    return;
  }

  const { frets, notes, barre, thumb, fingers } = voicing;
  const tip = (string) => tips.guitarStringTip(STRINGS[string].name, frets[string], notes[string], chordName,
    thumb?.string === string);

  if (barre) {
    const top = stringY(barre.to) - DOT_RADIUS;
    const bar = createSvg("rect", {
      class: "barre",
      x: fretX(barre.fret) - DOT_RADIUS, y: top,
      width: 2 * DOT_RADIUS, height: stringY(barre.from) + DOT_RADIUS - top,
      rx: DOT_RADIUS,
    });
    bar.append(createSvg("title", {}, tips.barreTip(barre.fret, barre.to - barre.from + 1)));
    svg.append(bar);
  }
  for (const { string, fret } of fingers) {
    const dot = createSvg("circle", { class: "finger", cx: fretX(fret), cy: stringY(string), r: DOT_RADIUS });
    dot.append(createSvg("title", {}, tip(string)));
    svg.append(dot);
  }
  // The thumb is a dot marked T.
  if (thumb) {
    const x = fretX(thumb.fret);
    const y = stringY(thumb.string);
    const mark = createSvg("g", { class: "thumb" });
    mark.append(
      createSvg("circle", { class: "finger", cx: x, cy: y, r: DOT_RADIUS }),
      createSvg("text", { class: "thumb-mark", x, y }, "T"),
      createSvg("title", {}, tip(thumb.string)),
    );
    svg.append(mark);
  }

  // Left of the nut: the note each string plays, then O or X.
  STRINGS.forEach((_, string) => {
    const y = stringY(string);
    const label = createSvg("g", { class: "string-label" });
    if (notes[string]) label.append(createSvg("text", { class: "string-note", x: NAME_X, y }, notes[string].name));
    if (frets[string] <= 0) {
      label.append(createSvg("text", { class: "string-mark", x: MARK_X, y }, frets[string] === 0 ? "O" : "X"));
    }
    label.append(createSvg("title", {}, tip(string)));
    svg.append(label);
  });
}

// The empty neck: the wood (maple in the light theme, ebony in the dark),
// frets, inlay dots, fret numbers, strings and the nut. The neck ends at
// `endX`; `fretX(fret)` is the middle of a fret.
function neck(endX, fretX) {
  const parts = [createSvg("rect", {
    class: "wood", x: NUT_X, y: TOP_Y - 12, width: endX - NUT_X, height: BOTTOM_Y - TOP_Y + 24, rx: 4,
  })];
  // A few faint lines of grain along the neck, bending at about a third
  // and three fifths of the way along.
  const along = (fraction) => NUT_X + fraction * (endX - NUT_X);
  for (const y of [TOP_Y + 5, TOP_Y + 2.2 * STRING_GAP, BOTTOM_Y - 1.4 * STRING_GAP, BOTTOM_Y + 6]) {
    parts.push(createSvg("path", {
      class: "grain", d: `M ${NUT_X} ${y} C ${along(0.28)} ${y + 5}, ${along(0.6)} ${y - 6}, ${endX} ${y + 2}`,
    }));
  }
  for (let fret = 1; fret <= FRETS; fret++) {
    const x = fretX(fret + 0.5); // The fret wire, half a fret past where the finger goes.
    parts.push(createSvg("line", { class: "fret", x1: x, y1: TOP_Y - 12, x2: x, y2: BOTTOM_Y + 12 }));
  }
  for (const fret of INLAYS) {
    parts.push(createSvg("circle", { class: "inlay", cx: fretX(fret), cy: MIDDLE_Y, r: 6 }));
  }
  for (const y of [TOP_Y + 1.5 * STRING_GAP, BOTTOM_Y - 1.5 * STRING_GAP]) {
    parts.push(createSvg("circle", { class: "inlay", cx: fretX(FRETS), cy: y, r: 6 }));
  }
  for (const fret of [...INLAYS, FRETS]) {
    parts.push(createSvg("text", { class: "fret-number", x: fretX(fret), y: BOTTOM_Y + 28 }, fret));
  }
  STRINGS.forEach((_, string) => {
    const y = stringY(string);
    // Lower strings are thicker.
    parts.push(createSvg("line", {
      class: "string", x1: NUT_X, y1: y, x2: endX, y2: y,
      "stroke-width": 1 + (STRINGS.length - 1 - string) * 0.3,
    }));
  });
  parts.push(createSvg("rect", {
    class: "nut", x: NUT_X - 5, y: TOP_Y - 14, width: 10, height: BOTTOM_Y - TOP_Y + 28, rx: 2,
  }));
  return parts;
}
