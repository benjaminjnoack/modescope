// Draws a guitar neck lying on its side: the nut on the left, the high e
// string on top (as in guitar tab), and frets 1-12 to the right. Left of
// the nut, each string shows the note it plays and O (open) or X (muted).

import { FRETS, STRINGS } from "./guitar.js";
import { createSvg } from "./svg.js";
import * as tips from "./tooltips.js";

const NAME_X = 22;
const MARK_X = 54;
const NUT_X = 76;
const END_X = 884;
const TOP_Y = 28;
const STRING_GAP = 26;
const FRET_WIDTH = (END_X - NUT_X) / FRETS;
const DOT_RADIUS = 10;
const INLAYS = [3, 5, 7, 9];

// Strings are listed low E first but drawn with the high e on top.
const stringY = (string) => TOP_Y + (STRINGS.length - 1 - string) * STRING_GAP;
const BOTTOM_Y = stringY(0);
const MIDDLE_Y = (TOP_Y + BOTTOM_Y) / 2;
// The middle of the space behind a fret, where a finger presses.
const fretX = (fret) => NUT_X + (fret - 0.5) * FRET_WIDTH;

// Redraw the neck for one voicing from voicingsFor (or null if there is none).
// `chordName` (e.g. "G7") is used in the tooltips.
export function renderFretboard(svg, voicing, chordName) {
  svg.replaceChildren(...neck());
  if (!voicing) {
    svg.append(createSvg("text", { class: "no-voicing", x: (NUT_X + END_X) / 2, y: MIDDLE_Y },
      "No easy fingering for this chord"));
    return;
  }

  const { frets, notes, barre, fingers } = voicing;
  const tip = (string) => tips.guitarStringTip(STRINGS[string].name, frets[string], notes[string], chordName);

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

// The empty neck: frets, inlay dots, fret numbers, strings and the nut.
function neck() {
  const parts = [];
  for (let fret = 1; fret <= FRETS; fret++) {
    const x = NUT_X + fret * FRET_WIDTH;
    parts.push(createSvg("line", { class: "fret", x1: x, y1: TOP_Y, x2: x, y2: BOTTOM_Y }));
  }
  for (const fret of INLAYS) {
    parts.push(createSvg("circle", { class: "inlay", cx: fretX(fret), cy: MIDDLE_Y, r: 6 }));
  }
  for (const y of [TOP_Y + 1.5 * STRING_GAP, BOTTOM_Y - 1.5 * STRING_GAP]) {
    parts.push(createSvg("circle", { class: "inlay", cx: fretX(FRETS), cy: y, r: 6 }));
  }
  for (const fret of [...INLAYS, FRETS]) {
    parts.push(createSvg("text", { class: "fret-number", x: fretX(fret), y: BOTTOM_Y + 24 }, fret));
  }
  STRINGS.forEach((_, string) => {
    const y = stringY(string);
    // Lower strings are thicker.
    parts.push(createSvg("line", {
      class: "string", x1: NUT_X, y1: y, x2: END_X, y2: y,
      "stroke-width": 1 + (STRINGS.length - 1 - string) * 0.3,
    }));
  });
  parts.push(createSvg("line", { class: "nut", x1: NUT_X, y1: TOP_Y - 2, x2: NUT_X, y2: BOTTOM_Y + 2 }));
  return parts;
}
