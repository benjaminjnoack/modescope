// The wheel's state. Unlocked (the default) uses relative modes: every mode
// shares the notes of one parent major scale, and the outer ring's rotation
// is derived from the parent key and the mode, so spinning the mode ring
// carries the notes along. Locking the note ring switches to parallel modes:
// the tonic stays put and only the mode changes.

import { NOTES, MODES, modeOffsetSemitones, spellings } from "./music.js";

export const NOTE_STEP = 360 / NOTES.length;
export const MODE_STEP = 360 / MODES.length;

// Both in degrees clockwise.
let parentRotation = 0;
let modeRotation = 0;
let noteRingLocked = false;
// The selected note (an index into NOTES), which of its spellings to use
// (e.g. 0 = "C♯", 1 = "D♭"), and the chord on it to spell out (a chord
// suffix such as "m7", or null for the panel's first chord). There is
// always exactly one selected note. It starts as the top note and moves
// with the ring as it turns.
let selection = { note: 0, spelling: 0, chord: null };

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

// Clicking a new note selects it with its first spelling. Clicking the
// selected note again cycles through its spellings.
export function clickNote(note) {
  if (note === selection.note) {
    const count = spellings(note).length;
    selection = { ...selection, spelling: (selection.spelling + 1) % count };
  } else {
    selection = { note, spelling: 0, chord: null };
  }
}

export function selectedChord() {
  return selection.chord;
}

export function selectChord(suffix) {
  selection = { ...selection, chord: suffix };
}

// The name of a note: the chosen spelling for the selected note, and every
// spelling (e.g. "C♯/D♭") for the others.
export function noteName(note) {
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
