// The wheel's state. Unlocked (the default) uses relative modes: every mode
// shares the notes of one parent major scale, and the outer ring's rotation
// is derived from the parent key and the mode, so spinning the mode ring
// carries the notes along. Locking the note ring switches to parallel modes:
// the tonic stays put and only the mode changes.

import { NOTES, MODES, modeOffsetSemitones } from "./music.js";

export const NOTE_STEP = 360 / NOTES.length;
export const MODE_STEP = 360 / MODES.length;

// Both in degrees clockwise.
let parentRotation = 0;
let modeRotation = 0;
let noteRingLocked = false;

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

export function tonicIndex() {
  return topIndex(getNoteRotation(), NOTE_STEP, NOTES.length);
}

export function currentMode() {
  return MODES[topIndex(modeRotation, MODE_STEP, MODES.length)];
}
