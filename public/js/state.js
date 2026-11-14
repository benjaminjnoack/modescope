// The wheel's state. Unlocked (the default) uses relative modes: every mode
// shares the notes of one parent major scale, and the outer ring's rotation
// is derived from the parent key and the mode, so spinning the mode ring
// carries the notes along. Locking the note ring switches to parallel modes:
// the tonic stays put and only the mode changes.

import { NOTES, MODES, defaultTonicName, modeOffsetSemitones, spellScale, spellings } from "./music.js";

export const NOTE_STEP = 360 / NOTES.length;
export const MODE_STEP = 360 / MODES.length;

// Both in degrees clockwise.
let parentRotation = 0;
let modeRotation = 0;
let noteRingLocked = false;
// The selected note (an index into NOTES), which of its spellings to use
// when it isn't in the mode (e.g. 0 = "C♯", 1 = "D♭"), and the chord on it
// to spell out: the chord suffix (e.g. "m7") and the index of the parallel
// mode it was chosen from, as { suffix, mode }, or null for the panel's
// first chord. There is always exactly one selected note. It starts as the
// top note and moves with the ring as it turns.
// `tonicSpelling` is the name chosen for a black-key tonic, as
// { note, name } (e.g. C♯ instead of D♭), or null to use the usual one.
// It's kept here so undoing a double-click restores it too.
let selection = { note: 0, spelling: 0, chord: null, tonicSpelling: null };

// Which item of a ring sits at the top, given its rotation.
function topIndex(rotation, step, count) {
  const steps = Math.round(-rotation / step);
  return ((steps % count) + count) % count;
}

export function getModeRotation() {
  return modeRotation;
}

// Unlocked: changing the mode keeps the parent key, so the notes stay the same.
// Locked: changing the mode keeps the tonic, so the parent key moves instead.
export function setModeRotation(rotation) {
  const noteRotationBefore = getNoteRotation();
  modeRotation = rotation;
  if (noteRingLocked) parentRotation += noteRotationBefore - getNoteRotation();
}

export function isNoteRingLocked() {
  return noteRingLocked;
}

export function toggleNoteRingLock() {
  noteRingLocked = !noteRingLocked;
}

export function getNoteRotation() {
  return parentRotation - modeOffsetSemitones(-modeRotation / MODE_STEP) * NOTE_STEP;
}

// Changing the key keeps the mode.
export function setNoteRotation(rotation) {
  parentRotation += rotation - getNoteRotation();
}

export function selectedNote() {
  return selection.note;
}

// Clicking a new note selects it. Clicking the selected note again
// switches its spelling: for the tonic that respells the whole scale
// (D♭ Ionian <-> C♯ Ionian); a note outside the mode cycles C♯ <-> D♭.
// Other notes of the mode are spelled by the scale, so they don't change.
export function clickNote(note) {
  if (note !== selection.note) {
    selection = { ...selection, note, spelling: 0, chord: null };
  } else if (note === tonicIndex()) {
    const names = spellings(note);
    const name = names[(names.indexOf(tonicName()) + 1) % names.length];
    selection = { ...selection, tonicSpelling: { note, name } };
  } else if (scaleDegreeOf(note) === -1) {
    const count = spellings(note).length;
    selection = { ...selection, spelling: (selection.spelling + 1) % count };
  }
}

export function selectedChord() {
  return selection.chord;
}

export function selectChord(chord) {
  selection = { ...selection, chord };
}

// The tonic's name: the spelling chosen for it, or else the usual one.
export function tonicName() {
  const tonic = tonicIndex();
  const chosen = selection.tonicSpelling;
  if (chosen && chosen.note === tonic) return chosen.name;
  return defaultTonicName(tonic, currentMode());
}

// Which degree of the current mode a note is (0-6), or -1 if it isn't in it.
function scaleDegreeOf(note) {
  const interval = (note - tonicIndex() + NOTES.length) % NOTES.length;
  return currentMode().intervals.indexOf(interval);
}

// The name of a note. Notes of the mode are spelled so every letter is used
// once (in F Ionian, "B♭"; in F♯ Ionian, "E♯"). A note outside the mode shows
// its chosen spelling when selected, and every spelling (e.g. "C♯/D♭") otherwise.
export function noteName(note) {
  const degree = scaleDegreeOf(note);
  if (degree !== -1) return spellScale(tonicName(), currentMode())[degree];
  return note === selection.note ? spellings(note)[selection.spelling] : NOTES[note];
}

// Save and restore the selection (used to undo the clicks of a double-click).
export function getSelection() {
  return selection;
}

export function setSelection(saved) {
  selection = saved;
}

export function currentModeIndex() {
  return topIndex(modeRotation, MODE_STEP, MODES.length);
}

export function tonicIndex() {
  return topIndex(getNoteRotation(), NOTE_STEP, NOTES.length);
}

export function currentMode() {
  return MODES[currentModeIndex()];
}
