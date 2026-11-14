// Builds the wheel and keeps it in sync with the state.

import { MODES, NOTES, chordsOn, chordType, scaleDegree, spellChord, spellings } from "./music.js";
import * as state from "./state.js";
import { createRing } from "./ring.js";
import { makeDraggable } from "./drag.js";
import { createSvg, point, segmentPath } from "./svg.js";
import * as tips from "./tooltips.js";

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
const spelledName = document.getElementById("spelled-chord-name");
const spelledNotes = document.getElementById("spelled-chord-notes");

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
  // Each has a tooltip naming the chord it stands for.
  numeralGroup.replaceChildren(...mode.intervals.map((interval, degree) => {
    const [x, y] = point(NUMERAL_RADIUS, interval * state.NOTE_STEP);
    const numeral = mode.numerals[degree];
    const root = (tonic + interval) % NOTES.length;
    const triad = state.noteName(root) + chordsOn(mode, tonic, root).chords[0];
    const text = createSvg("text", { class: "numeral", x, y }, numeral);
    text.append(createSvg("title", {}, tips.numeralTip(numeral, state.noteName(tonic), mode, triad)));
    return text;
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

  // Panel rows: the current mode first, then the rest in order.
  const rows = MODES.map((_, offset) => {
    const modeIndex = (start + offset) % MODES.length;
    const mode = MODES[modeIndex];
    return { mode, modeIndex, offset, result: chordsOn(mode, tonic, note) };
  });

  // The chord to spell: the one clicked, or the panel's first chord if
  // nothing was clicked or the clicked chord is no longer listed.
  const listed = rows.flatMap(({ modeIndex, result }) =>
    (result ? result.chords.map((suffix) => ({ suffix, mode: modeIndex })) : []));
  const sameChord = (a, b) => a && b && a.suffix === b.suffix && a.mode === b.mode;
  if (!listed.some((choice) => sameChord(choice, state.selectedChord()))) {
    state.selectChord(listed[0]);
  }
  const chord = state.selectedChord();
  renderSpelledChord(rootName, chord.suffix, MODES[chord.mode]);

  chordList.replaceChildren(...rows.map(({ mode, modeIndex, offset, result }) => {
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
    if (result) {
      numeral.title = tips.numeralTip(result.numeral, tonicName, mode, rootName + result.chords[0]);
    } else {
      numeral.title = `${rootName} isn't in ${tonicName} ${mode.name}, so there are no chords on it.`;
    }
    header.append(modeLabel, numeral);
    item.append(header);

    // The chords available on this note, as a wrapping list.
    if (result) {
      const chords = document.createElement("ul");
      chords.className = "chords";
      chords.append(...result.chords.map((suffix) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = rootName + suffix;
        button.title = tips.chordTypeTip(rootName + suffix, chordType(suffix));
        // The exact chord clicked is emphasized; the same chord in other
        // modes gets a lighter highlight.
        const choice = { suffix, mode: modeIndex };
        button.classList.toggle("spelled", sameChord(choice, chord));
        button.classList.toggle("same-chord", suffix === chord.suffix && !sameChord(choice, chord));
        button.addEventListener("click", () => {
          state.selectChord(choice);
          render();
        });
        item.append(button);
        return item;
      }));
      item.append(chords);
    }
    return item;
  }));
}

// Spell out a chord's notes under the wheel, with each note's scale degree
// in the parallel mode it was chosen from (in C Lydian, D is D F♯ A: 2 ♯4 6).
function renderSpelledChord(rootName, suffix, mode) {
  const tonic = state.tonicIndex();
  const names = spellChord(rootName, chordType(suffix));

  // If the tonic's spelling hasn't been chosen (it isn't the selected note),
  // use whichever spelling gives the degrees the fewest accidentals.
  const tonicName = state.selectedNote() === tonic
    ? state.noteName(tonic)
    : bestTonicSpelling(tonic, names);
  const type = chordType(suffix);
  const degreeLabels = names.map((name) => scaleDegree(tonicName, name));

  // Heading, e.g. "Dm7 in C Lydian", with a tooltip on each part.
  const tipSpan = (text, title) => {
    const span = document.createElement("span");
    span.className = "has-tip";
    span.textContent = text;
    span.title = title;
    return span;
  };
  spelledName.replaceChildren(
    tipSpan(rootName, tips.rootTip({ rootName, tonicName, mode, type, degreeLabels })),
    ...(suffix ? [tipSpan(suffix, tips.chordTypeTip(rootName + suffix, type))] : []),
    " in ",
    tipSpan(tonicName, tips.tonicTip(tonicName, mode)),
    " ",
    tipSpan(mode.name, tips.modeTip(mode)),
  );

  spelledNotes.replaceChildren(...names.map((name, i) => {
    const degree = degreeLabels[i];
    const item = document.createElement("li");
    const noteLabel = document.createElement("span");
    noteLabel.className = "spelled-note";
    noteLabel.textContent = name;
    const degreeLabel = document.createElement("span");
    degreeLabel.className = "spelled-degree";
    degreeLabel.textContent = degree;
    item.title = tips.degreeTip(name, degree, tonicName, mode);
    item.append(noteLabel, degreeLabel);
    return item;
  }));
}

function bestTonicSpelling(tonic, names) {
  const accidentals = (tonicName) =>
    names.map((name) => scaleDegree(tonicName, name)).join("").replace(/\d/g, "").length;
  return spellings(tonic).reduce((best, name) => (accidentals(name) < accidentals(best) ? name : best));
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
