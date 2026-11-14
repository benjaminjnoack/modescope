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

const CHORD_SUFFIXES = { major: "", minor: "m", diminished: "°", augmented: "+" };

// Quality of the triad built on `degree` (0-based) of a mode, from its intervals.
export function triadQuality(mode, degree) {
  const { intervals } = mode;
  const above = (steps) => {
    const target = degree + steps;
    const octave = Math.floor(target / intervals.length) * NOTES.length;
    return intervals[target % intervals.length] + octave - intervals[degree];
  };
  const third = above(2);
  const fifth = above(4);
  if (third === 4 && fifth === 7) return "major";
  if (third === 3 && fifth === 7) return "minor";
  if (third === 3 && fifth === 6) return "diminished";
  if (third === 4 && fifth === 8) return "augmented";
  return "other";
}

// Chord name for a root note index and quality, e.g. "Dm" or "C♯m/D♭m".
export function chordName(root, quality) {
  const suffix = CHORD_SUFFIXES[quality] ?? "?";
  return NOTES[root].split("/").map((name) => name + suffix).join("/");
}

// The triad on `root` in `mode` built on `tonic` (both note indexes),
// or null if `root` isn't in that mode.
export function chordOn(mode, tonic, root) {
  const interval = (root - tonic + NOTES.length) % NOTES.length;
  const degree = mode.intervals.indexOf(interval);
  if (degree === -1) return null;
  return {
    numeral: mode.numerals[degree],
    name: chordName(root, triadQuality(mode, degree)),
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
