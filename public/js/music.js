// Music theory data and helpers. No DOM code here.

export const NOTES = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"];

// Each mode: semitones above the tonic, and the Roman numeral of the chord
// built on each degree. Listed in order of the parent major scale's degrees.
export const MODES = [
  { name: "Ionian",     description: "the major scale", intervals: [0, 2, 4, 5, 7, 9, 11], numerals: ["I", "ii", "iii", "IV", "V", "vi", "vii°"] },
  { name: "Dorian",     description: "a minor mode with a raised 6th (natural minor with ♮6)", intervals: [0, 2, 3, 5, 7, 9, 10], numerals: ["i", "ii", "♭III", "IV", "v", "vi°", "♭VII"] },
  { name: "Phrygian",   description: "a minor mode with a lowered 2nd (♭2)", intervals: [0, 1, 3, 5, 7, 8, 10], numerals: ["i", "♭II", "♭III", "iv", "v°", "♭VI", "♭vii"] },
  { name: "Lydian",     description: "a major mode with a raised 4th (♯4)", intervals: [0, 2, 4, 6, 7, 9, 11], numerals: ["I", "II", "iii", "♯iv°", "V", "vi", "vii"] },
  { name: "Mixolydian", description: "a major mode with a lowered 7th (♭7)", intervals: [0, 2, 4, 5, 7, 9, 10], numerals: ["I", "ii", "iii°", "IV", "v", "vi", "♭VII"] },
  { name: "Aeolian",    description: "the natural minor scale", intervals: [0, 2, 3, 5, 7, 8, 10], numerals: ["i", "ii°", "♭III", "iv", "v", "♭VI", "♭VII"] },
  { name: "Locrian",    description: "a diminished mode with a lowered 2nd and 5th (♭2, ♭5)", intervals: [0, 1, 3, 5, 6, 8, 10], numerals: ["i°", "♭II", "♭iii", "iv", "♭V", "♭VI", "♭vii"] },
];

// Chord types. Each tone is [degree, semitones above the root]; the degree
// (1, 3, 5, 6, 7, 9, 11, 13, or 2/4 for sus chords) decides which letter spells it.
// A chord is available in a mode when every one of its notes is in the mode.
// 13th chords leave out the 11th, as is usual in practice.
export const CHORD_TYPES = [
  { suffix: "",      name: "major triad", tones: [[1, 0], [3, 4], [5, 7]] },
  { suffix: "m",     name: "minor triad", tones: [[1, 0], [3, 3], [5, 7]] },
  { suffix: "°",     name: "diminished triad", tones: [[1, 0], [3, 3], [5, 6]] },
  { suffix: "5",     name: "power chord (root and 5th, no 3rd)", tones: [[1, 0], [5, 7]] },
  { suffix: "sus2",  name: "suspended 2nd (the 2nd replaces the 3rd)", tones: [[1, 0], [2, 2], [5, 7]] },
  { suffix: "sus4",  name: "suspended 4th (the 4th replaces the 3rd)", tones: [[1, 0], [4, 5], [5, 7]] },
  { suffix: "6",     name: "major 6th (a major triad with an added 6th)", tones: [[1, 0], [3, 4], [5, 7], [6, 9]] },
  { suffix: "m6",    name: "minor 6th (a minor triad with an added major 6th)", tones: [[1, 0], [3, 3], [5, 7], [6, 9]] },
  { suffix: "7",     name: "dominant 7th", tones: [[1, 0], [3, 4], [5, 7], [7, 10]] },
  { suffix: "maj7",  name: "major 7th", tones: [[1, 0], [3, 4], [5, 7], [7, 11]] },
  { suffix: "m7",    name: "minor 7th", tones: [[1, 0], [3, 3], [5, 7], [7, 10]] },
  { suffix: "m7♭5",  name: "half-diminished 7th (minor 7th with a ♭5)", tones: [[1, 0], [3, 3], [5, 6], [7, 10]] },
  { suffix: "add9",  name: "added 9th (a major triad with the 9th, no 7th)", tones: [[1, 0], [3, 4], [5, 7], [9, 14]] },
  { suffix: "madd9", name: "minor added 9th (a minor triad with the 9th, no 7th)", tones: [[1, 0], [3, 3], [5, 7], [9, 14]] },
  { suffix: "9",     name: "dominant 9th", tones: [[1, 0], [3, 4], [5, 7], [7, 10], [9, 14]] },
  { suffix: "maj9",  name: "major 9th", tones: [[1, 0], [3, 4], [5, 7], [7, 11], [9, 14]] },
  { suffix: "m9",    name: "minor 9th", tones: [[1, 0], [3, 3], [5, 7], [7, 10], [9, 14]] },
  { suffix: "m11",   name: "minor 11th", tones: [[1, 0], [3, 3], [5, 7], [7, 10], [9, 14], [11, 17]] },
  { suffix: "13",    name: "dominant 13th (the 11th is usually left out)", tones: [[1, 0], [3, 4], [5, 7], [7, 10], [9, 14], [13, 21]] },
  { suffix: "maj13", name: "major 13th (the 11th is usually left out)", tones: [[1, 0], [3, 4], [5, 7], [7, 11], [9, 14], [13, 21]] },
];

export function chordType(suffix) {
  return CHORD_TYPES.find((type) => type.suffix === suffix);
}

// The columns of the chord table, in order.
export const CHORD_FAMILIES = ["Triad", "Power", "Sus", "6th", "7th", "9th", "11th · 13th"];

// Which family a chord type belongs to, worked out from its tones so a new
// chord type finds its column by itself: m7 (1 ♭3 5 ♭7) is a "7th",
// sus4 (1 4 5) is "Sus", and 5 (1 5) is "Power".
export function chordFamily(type) {
  const degrees = type.tones.map(([degree]) => degree);
  if (degrees.length === 2) return "Power";
  if (degrees.includes(2) || degrees.includes(4)) return "Sus";
  const highest = Math.max(...degrees);
  if (highest === 5) return "Triad";
  if (highest === 6) return "6th";
  if (highest === 7) return "7th";
  if (highest === 9) return "9th";
  return "11th · 13th";
}

const LETTERS = "CDEFGAB";
const LETTER_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

// Semitones above the root for each chord degree in a major scale.
const MAJOR_DEGREES = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 9: 14, 11: 17, 13: 21 };

// A chord type's formula, counted from its own root: "1 ♭3 5 ♭7" for m7.
export function chordFormula(type) {
  return type.tones
    .map(([degree, semitones]) => accidental(semitones - MAJOR_DEGREES[degree]) + degree)
    .join(" ");
}

// "♭" for -1, "♯♯" for 2, and so on.
function accidental(offset) {
  return offset < 0 ? "♭".repeat(-offset) : "♯".repeat(offset);
}

// Distance in semitones wrapped into -6..5.
function wrapOffset(semitones) {
  return ((semitones % 12) + 18) % 12 - 6;
}

// Split a note name like "D♭" into its letter index and semitones.
function parseNote(name) {
  const letter = LETTERS.indexOf(name[0]);
  const offset = [...name.slice(1)].reduce((sum, c) => sum + (c === "♯" ? 1 : -1), 0);
  return { letter, offset, semitones: LETTER_SEMITONES[letter] + offset };
}

// A note name's index into NOTES: "D♭" and "C♯" are 1, "C♭" is 11.
export function noteIndex(name) {
  return ((parseNote(name).semitones % NOTES.length) + NOTES.length) % NOTES.length;
}

// Spell a chord from its root's name (e.g. "D♭") and its type. Each chord
// tone gets its own letter (a 3rd is two letters above the root), so D♭m
// is D♭ F♭ A♭, not D♭ E A♭. Returns the note names.
export function spellChord(rootName, type) {
  const root = parseNote(rootName);
  return type.tones.map(([degree, semitones]) => spellAbove(root, degree - 1, semitones));
}

// The note `semitones` above `root`, spelled with the letter `steps` letters
// above the root's: 2 steps and 3 semitones above D♭ is F♭.
function spellAbove(root, steps, semitones) {
  const letter = (root.letter + steps) % LETTERS.length;
  const offset = wrapOffset(root.semitones + semitones - LETTER_SEMITONES[letter]);
  return LETTERS[letter] + accidental(offset);
}

// Spell a mode from its tonic's name so that each letter A-G is used
// exactly once: F Ionian is F G A B♭ C D E, and F♯ Ionian ends on E♯, not F.
export function spellScale(tonicName, mode) {
  const tonic = parseNote(tonicName);
  return mode.intervals.map((semitones, degree) => spellAbove(tonic, degree, semitones));
}

// The usual name for the tonic `tonic` (a note index) in `mode`: the
// spelling whose scale has the fewest accidentals, so D♭ Ionian (5 flats)
// rather than C♯ Ionian (7 sharps). Ties go to the first spelling.
export function defaultTonicName(tonic, mode) {
  const accidentals = (name) => spellScale(name, mode).join("").replace(/[A-G]/g, "").length;
  return spellings(tonic).reduce((best, name) => (accidentals(name) < accidentals(best) ? name : best));
}

// A note's scale degree above a tonic, compared with the tonic's major
// scale: above C, F♯ is "♯4" and B♭ is "♭7". Both are note names.
export function scaleDegree(tonicName, noteName) {
  const tonic = parseNote(tonicName);
  const note = parseNote(noteName);
  const steps = (note.letter - tonic.letter + LETTERS.length) % LETTERS.length;
  const majorSemitones = LETTER_SEMITONES[steps]; // Major scale = C major's letter steps.
  const offset = wrapOffset(note.semitones - tonic.semitones - majorSemitones);
  return accidental(offset) + (steps + 1);
}


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
      .filter((type) => type.tones.every(([, semitones]) => inMode(semitones)))
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

// Key signatures. A signature is a count: sharps are positive and flats
// negative, so 2 is two sharps (D major) and -4 is four flats (A♭ major).
// It only says which notes are used, so every mode of one parent major scale
// shares it: four flats is also F Aeolian, B♭ Dorian, C Phrygian and so on.

// Sharps are written in this order; flats in the reverse (B♭ E♭ A♭ ...).
const SHARP_ORDER = "FCGDAEB";

// The key signature of a scale spelled with one letter per note
// (from spellScale): F Aeolian, F G A♭ B♭ C D♭ E♭, is -4.
export function keySignature(scale) {
  return scale.reduce((sum, name) => sum + parseNote(name).offset, 0);
}

// A scale's sharps or flats in the order a staff shows them: B♭ E♭ A♭ D♭.
export function signatureNotes(scale) {
  const altered = scale.filter((name) => name.length > 1);
  const flats = altered.some((name) => name.includes("♭"));
  const order = flats ? [...SHARP_ORDER].reverse().join("") : SHARP_ORDER;
  return altered.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
}

// The major key with a key signature: each sharp is a 5th up from C
// (C G D A ...), each flat a 4th up (C F B♭ E♭ ...). 2 is "D", -4 is "A♭".
export function majorForSignature(count) {
  let name = "C";
  for (let i = 0; i < Math.abs(count); i++) {
    name = count > 0 ? spellAbove(parseNote(name), 4, 7) : spellAbove(parseNote(name), 3, 5);
  }
  return name;
}

// The parent major key of the mode at `modeIndex` (0 = Ionian) on a tonic:
// F Aeolian's is A♭, D Dorian's is C.
export function parentMajorName(tonicName, modeIndex) {
  const steps = (LETTERS.length - modeIndex) % LETTERS.length;
  const semitones = (NOTES.length - MODES[0].intervals[modeIndex]) % NOTES.length;
  return spellAbove(parseNote(tonicName), steps, semitones);
}
