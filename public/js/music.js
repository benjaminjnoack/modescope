// Music theory data and helpers. No DOM code here.

export const NOTES = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"];

// Each mode: semitones above the tonic, and the Roman numeral of the chord
// built on each degree. Listed in order of the parent major scale's degrees.
export const MODES = [
  { name: "Ionian",     intervals: [0, 2, 4, 5, 7, 9, 11], numerals: ["I", "ii", "iii", "IV", "V", "vi", "vii°"] },
  { name: "Dorian",     intervals: [0, 2, 3, 5, 7, 9, 10], numerals: ["i", "ii", "♭III", "IV", "v", "vi°", "♭VII"] },
  { name: "Phrygian",   intervals: [0, 1, 3, 5, 7, 8, 10], numerals: ["i", "♭II", "♭III", "iv", "v°", "♭VI", "♭vii"] },
  { name: "Lydian",     intervals: [0, 2, 4, 6, 7, 9, 11], numerals: ["I", "II", "iii", "♯iv°", "V", "vi", "vii"] },
  { name: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10], numerals: ["I", "ii", "iii°", "IV", "v", "vi", "♭VII"] },
  { name: "Aeolian",    intervals: [0, 2, 3, 5, 7, 8, 10], numerals: ["i", "ii°", "♭III", "iv", "v", "♭VI", "♭VII"] },
  { name: "Locrian",    intervals: [0, 1, 3, 5, 6, 8, 10], numerals: ["i°", "♭II", "♭iii", "iv", "♭V", "♭VI", "♭vii"] },
];

// Chord types, as semitones above the root (wrapped into one octave, so a
// 9th is 2, an 11th is 5 and a 13th is 9). A chord is available in a mode
// when every one of its notes is in the mode. 13th chords leave out the
// 11th, as is usual in practice.
export const CHORD_TYPES = [
  { suffix: "",      notes: [0, 4, 7] },
  { suffix: "m",     notes: [0, 3, 7] },
  { suffix: "°",     notes: [0, 3, 6] },
  { suffix: "sus4",  notes: [0, 5, 7] },
  { suffix: "7",     notes: [0, 4, 7, 10] },
  { suffix: "maj7",  notes: [0, 4, 7, 11] },
  { suffix: "m7",    notes: [0, 3, 7, 10] },
  { suffix: "m7♭5",  notes: [0, 3, 6, 10] },
  { suffix: "9",     notes: [0, 4, 7, 10, 2] },
  { suffix: "maj9",  notes: [0, 4, 7, 11, 2] },
  { suffix: "m9",    notes: [0, 3, 7, 10, 2] },
  { suffix: "m11",   notes: [0, 3, 7, 10, 2, 5] },
  { suffix: "13",    notes: [0, 4, 7, 10, 2, 9] },
  { suffix: "maj13", notes: [0, 4, 7, 11, 2, 9] },
];

// The ways to spell a note, e.g. ["C♯", "D♭"] or just ["D"].
export function spellings(note) {
  return NOTES[note].split("/");
}

// The chords on `root` in `mode` built on `tonic` (both note indexes):
// the degree's Roman numeral and the suffix of every chord type that fits
// the mode (e.g. "m7"). Null if `root` isn't in that mode.
export function chordsOn(mode, tonic, root) {
  const interval = (root - tonic + NOTES.length) % NOTES.length;
  const degree = mode.intervals.indexOf(interval);
  if (degree === -1) return null;
  const inMode = (semitones) =>
    mode.intervals.includes((interval + semitones) % NOTES.length);
  return {
    numeral: mode.numerals[degree],
    chords: CHORD_TYPES
      .filter((type) => type.notes.every(inMode))
      .map((type) => type.suffix),
  };
}

// Semitones from the parent major tonic up to the tonic of the mode at
// `position` (0 = Ionian, 1 = Dorian, ...). Fractional positions are
// interpolated, so the result changes smoothly between modes.
export function modeOffsetSemitones(position) {
  const parent = MODES[0].intervals;
  const semitonesAt = (n) => {
    const wraps = Math.floor(n / parent.length);
    return wraps * NOTES.length + parent[n - wraps * parent.length];
  };
  const n = Math.floor(position);
  const fraction = position - n;
  return semitonesAt(n) + fraction * (semitonesAt(n + 1) - semitonesAt(n));
}
