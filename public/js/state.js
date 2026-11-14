// The wheel's state. Unlocked (the default) uses relative modes: every mode
// shares the notes of one parent major scale, and the outer ring's rotation
// is derived from the parent key and the mode, so spinning the mode ring
// carries the notes along. Locking the note ring switches to parallel modes:
// the tonic stays put and only the mode changes.

import {
  NOTES, MODES, defaultTonicName, keySignature, majorForSignature, modeOffsetSemitones,
  noteIndex, parentMajorName, spellScale, spellings,
} from "./music.js";

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
// `keySpelling` is how the user chose to spell the parent major key, as
// { parent, name } (e.g. { parent: 1, name: "C♯" } for 7 sharps instead of
// D♭'s 5 flats), or null to use the usual spelling. It belongs to the parent
// key rather than the tonic, so turning the mode ring keeps the sharps.
// It's kept here so undoing a double-click restores it too.
let selection = { note: 0, spelling: 0, chord: null, keySpelling: null };

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
    spellKey(parentMajorName(name, currentModeIndex()));
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

// The tonic's name: from the parent key's chosen spelling, or else the usual one.
export function tonicName() {
  const chosen = selection.keySpelling;
  if (chosen && chosen.parent === parentIndex()) {
    return spellScale(chosen.name, MODES[0])[currentModeIndex()];
  }
  return defaultTonicName(tonicIndex(), currentMode());
}

// The parent major key (a note index): C for D Dorian.
function parentIndex() {
  return (tonicIndex() - MODES[0].intervals[currentModeIndex()] + NOTES.length) % NOTES.length;
}

function spellKey(parentName) {
  selection = { ...selection, keySpelling: { parent: noteIndex(parentName), name: parentName } };
}

// The current key signature: 2 for two sharps, -4 for four flats.
export function keySignatureNow() {
  return keySignature(spellScale(tonicName(), currentMode()));
}

// The mode on the current tonic with a key signature, as
// { modeIndex, tonicName }, or null if there isn't one: with C as the
// tonic, four flats is C Phrygian, but no mode on C has six sharps.
export function modeForSignature(count) {
  for (const [modeIndex, mode] of MODES.entries()) {
    for (const name of spellings(tonicIndex())) {
      if (keySignature(spellScale(name, mode)) === count) return { modeIndex, tonicName: name };
    }
  }
  return null;
}

// Jump to a key signature. Unlocked, the outer ring turns to its notes and
// the mode stays: two sharps in Aeolian is B Aeolian. Locked, the tonic
// stays and the mode changes: four flats on C is C Phrygian.
export function setKeySignature(count) {
  if (noteRingLocked) {
    const match = modeForSignature(count);
    if (!match) return;
    const steps = wrap(match.modeIndex - currentModeIndex(), MODES.length);
    setModeRotation(modeRotation - steps * MODE_STEP);
    spellKey(parentMajorName(match.tonicName, match.modeIndex));
  } else {
    const parentName = majorForSignature(count);
    const steps = wrap(noteIndex(parentName) - parentIndex(), NOTES.length);
    setNoteRotation(getNoteRotation() - steps * NOTE_STEP);
    spellKey(parentName);
  }
}

// The shortest way round a ring of `count` items: 5 steps of 7 is -2.
function wrap(steps, count) {
  const half = Math.floor(count / 2);
  return ((steps % count) + count + half) % count - half;
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
