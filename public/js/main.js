// Builds the wheel and keeps it in sync with the state.

import { NOTES, MODES, chordsOn } from "./music.js";
import * as state from "./state.js";
import { createRing } from "./ring.js";
import { makeDraggable } from "./drag.js";
import { createSvg, point, segmentPath } from "./svg.js";

// Ring sizes: notes outside, modes inside, key/mode label in the center.
const NOTE_RING = { inner: 130, outer: 180 };
const MODE_RING = { inner: 75, outer: 130 };
const NUMERAL_RADIUS = NOTE_RING.outer + 20;

const svg = document.getElementById("wheel");
const noteGroup = document.getElementById("note-ring");
const modeGroup = document.getElementById("mode-ring");
const numeralGroup = document.getElementById("numerals");
const keyName = document.getElementById("key-name");
const modeName = document.getElementById("mode-name");
const selectedMarker = document.getElementById("selected-marker");
const chordPanelTitle = document.getElementById("chord-panel-title");
const chordList = document.getElementById("chord-list");

const noteRing = createRing(noteGroup, NOTES, NOTE_RING);
const modeRing = createRing(modeGroup, MODES.map((mode) => mode.name), MODE_RING);

function render() {
  const tonic = state.tonicIndex();
  const mode = state.currentMode();

  // Outer ring: tonic selected, other notes of the mode highlighted.
  noteRing.layout(state.getNoteRotation(), (i) => {
    const interval = (i - tonic + NOTES.length) % NOTES.length;
    if (interval === 0) return ["selected"];
    if (mode.intervals.includes(interval)) return ["in-mode"];
    return [];
  });

  // Selected note shows its chosen spelling; the others show every spelling.
  NOTES.forEach((_, i) => noteRing.setLabel(i, state.noteName(i)));

  // Inner ring: the current mode selected.
  modeRing.layout(state.getModeRotation(), (i) => (MODES[i] === mode ? ["selected"] : []));

  // Roman numerals stay fixed outside the ring, one per mode degree.
  numeralGroup.replaceChildren(...mode.intervals.map((interval, degree) => {
    const [x, y] = point(NUMERAL_RADIUS, interval * state.NOTE_STEP);
    return createSvg("text", { class: "numeral", x, y }, mode.numerals[degree]);
  }));

  keyName.textContent = state.noteName(tonic);
  modeName.textContent = mode.name;

  noteGroup.classList.toggle("locked", state.isNoteRingLocked());

  renderSelectedNote();
}

// Outline the selected segment and show its chords in every parallel mode.
function renderSelectedNote() {
  const note = state.selectedNote();
  const center = note * state.NOTE_STEP + state.getNoteRotation();
  selectedMarker.setAttribute("d", segmentPath(
    NOTE_RING.inner, NOTE_RING.outer,
    center - state.NOTE_STEP / 2, center + state.NOTE_STEP / 2));

  // Start at the current mode, then continue in order (Ionian -> Dorian ...).
  const tonic = state.tonicIndex();
  const start = state.currentModeIndex();
  const rootName = state.noteName(note);
  const tonicName = state.noteName(tonic);
  chordPanelTitle.textContent = `Chords on ${rootName}`;
  chordList.replaceChildren(...MODES.map((_, offset) => {
    const mode = MODES[(start + offset) % MODES.length];
    const result = chordsOn(mode, tonic, note);
    const item = document.createElement("li");
    item.classList.toggle("current", offset === 0);
    item.classList.toggle("absent", result === null);

    // Header: mode name, and the degree's Roman numeral.
    const header = document.createElement("div");
    header.className = "chord-header";
    const modeLabel = document.createElement("span");
    modeLabel.textContent = `${tonicName} ${mode.name}`;
    const numeral = document.createElement("span");
    numeral.textContent = result ? result.numeral : "—";
    header.append(modeLabel, numeral);
    item.append(header);

    // The chords available on this note, as a wrapping list.
    if (result) {
      const chords = document.createElement("ul");
      chords.className = "chords";
      chords.append(...result.chords.map((suffix) => {
        const chord = document.createElement("li");
        chord.textContent = rootName + suffix;
        return chord;
      }));
      item.append(chords);
    }
    return item;
  }));
}

makeDraggable(svg, noteGroup, {
  getRotation: state.getNoteRotation,
  setRotation: state.setNoteRotation,
  step: state.NOTE_STEP,
  onChange: render,
  canDrag: () => !state.isNoteRingLocked(),
  // Click a note to select it; click it again to change its spelling.
  onTap: (target) => {
    const note = noteRing.indexOf(target);
    if (note === -1) return;
    recentSelections = [state.getSelection(), ...recentSelections].slice(0, 2);
    state.clickNote(note);
    render();
  },
});

// The selections from before the last two clicks, newest first.
let recentSelections = [];

// Double-click the outer ring to lock/unlock it (parallel vs. relative modes).
// A double-click's two clicks shouldn't change the selection, so undo them.
noteGroup.addEventListener("dblclick", () => {
  if (recentSelections.length === 2) state.setSelection(recentSelections[1]);
  recentSelections = [];
  state.toggleNoteRingLock();
  render();
});

makeDraggable(svg, modeGroup, {
  getRotation: state.getModeRotation,
  setRotation: state.setModeRotation,
  step: state.MODE_STEP,
  onChange: render,
});

render();
