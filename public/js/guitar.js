// Guitar fingerings: hand-picked ones from alternates.js, plus one worked
// out from the chord's notes. No DOM code here.

import { PREFERRED, SUGGESTED } from "./alternates.js";
import { CHORD_TYPES, chordFormula, noteIndex, spellChord, NOTES } from "./music.js";

// Standard tuning, low to high: E A D G B E, as indexes into NOTES.
export const STRINGS = [
  { name: "low E", note: 4 },
  { name: "A", note: 9 },
  { name: "D", note: 2 },
  { name: "G", note: 7 },
  { name: "B", note: 11 },
  { name: "high e", note: 4 },
];

// The neck drawn on the page, and the most frets one hand can cover.
export const FRETS = 12;
const REACH = 4;
const MUTED = -1;

const voicings = new Map();

// Every way the app knows to play a chord, from its root's name and type,
// best first: the PREFERRED ones from alternates.js, then the SUGGESTED
// ones, then the easiest root-position one it works out itself. Empty if
// there are none. Each is:
// - frets: one per string, low E first; -1 is muted, 0 open.
// - notes: what each string plays, as { name, degree } spelled from the
//   chord (so D♭m's 3rd is F♭, not E), or null when muted.
// - barre: { fret, from, to } (string indexes) when one finger lies across
//   several strings, else null.
// - thumb: { string, fret } when the thumb frets the low E string from over
//   the top of the neck, else null. Only hand-picked voicings use it.
// - fingers: the other fretted notes, as { string, fret }.
export function voicingsFor(rootName, type) {
  const key = `${rootName} ${type.suffix}`;
  if (!voicings.has(key)) {
    const found = findVoicing(rootName, type);
    const all = [
      ...listedFrets(PREFERRED, rootName, type),
      ...listedFrets(SUGGESTED, rootName, type),
      ...(found ? [{ frets: found, thumb: null }] : []),
    ];
    const unique = all.filter(({ frets }, i) =>
      all.findIndex((other) => other.frets.join() === frets.join()) === i);
    voicings.set(key, unique.flatMap(({ frets, thumb }) => describe(rootName, type, frets, thumb) ?? []));
  }
  return voicings.get(key);
}

// A chord's voicings from one table in alternates.js, parsed by parseFrets.
// G♯m and A♭m share theirs.
function listedFrets(table, rootName, type) {
  const root = noteIndex(rootName);
  return Object.entries(table).flatMap(([chord, list]) => {
    const [, name, suffix] = chord.match(/^([A-G][♯♭]?)(.*)$/);
    return noteIndex(name) === root && suffix === type.suffix ? list.map(parseFrets) : [];
  });
}

// "x32010" or "8 10 10 9 8 8" -> frets [-1, 3, 2, 0, 1, 0] or [8, 10, 10, 9, 8, 8].
// A "T" before a fret means the thumb plays it: "T133210" (Fmaj7) is
// frets [1, 3, 3, 2, 1, 0] with thumb 0, the low E string.
function parseFrets(text) {
  const parts = text.includes(" ") ? text.split(" ") : text.match(/T?./g);
  const thumb = parts.findIndex((part) => part.startsWith("T"));
  const frets = parts.map((part) => part.replace(/^T/, "")).map((part) => (part === "x" ? MUTED : Number(part)));
  return { frets, thumb: thumb === -1 ? null : thumb };
}

// Problems with the voicings in alternates.js, as a list of messages
// (empty when they're all fine). Run from Node:
// node -e 'import("./public/js/guitar.js").then((g) => console.log(g.checkAlternates()))'
export function checkAlternates() {
  return [PREFERRED, SUGGESTED].flatMap(Object.entries).flatMap(([chord, list]) => {
    const match = chord.match(/^([A-G][♯♭]?)(.*)$/);
    const type = match && CHORD_TYPES.find(({ suffix }) => suffix === match[2]);
    if (!type) return [`${chord}: not a root and chord suffix from CHORD_TYPES`];
    return list.flatMap((text) => {
      const { frets, thumb } = parseFrets(text);
      const where = `${chord} ${text}`;
      if (frets.length !== STRINGS.length) return [`${where}: needs ${STRINGS.length} strings`];
      if (frets.some((fret) => Number.isNaN(fret) || fret > FRETS)) {
        return [`${where}: frets must be x or 0-${FRETS}`];
      }
      if (thumb !== null && (thumb !== 0 || frets[0] <= 0 || text.split("T").length > 2)) {
        return [`${where}: the thumb (T) can only fret the low E string`];
      }
      if (!describe(match[1], type, frets, thumb)) return [`${where}: plays a note that isn't in ${chord}`];
      const { barre, fingers } = fingering(frets, thumb);
      if (fingers.length + (barre ? 1 : 0) > 4) return [`${where}: needs more than four fingers`];
      return [];
    });
  });
}

// A voicing's notes and fingering, or null if a string plays a note
// that isn't in the chord. `thumb` is the string the thumb frets, or null.
function describe(rootName, type, frets, thumb = null) {
  const names = spellChord(rootName, type);
  const degrees = chordFormula(type).split(" ");
  const tones = names.map(noteIndex);
  const notes = frets.map((fret, i) => {
    if (fret === MUTED) return null;
    const tone = tones.indexOf(soundingNote(i, fret));
    return tone === -1 ? undefined : { name: names[tone], degree: degrees[tone] };
  });
  if (notes.includes(undefined)) return null;
  return { frets, notes, ...fingering(frets, thumb) };
}

// The easiest root-position voicing the app can find, as a fret list, or null.
function findVoicing(rootName, type) {
  const tones = spellChord(rootName, type).map(noteIndex);
  const root = tones[0];
  const required = tones.filter((_, i) => !optional(type, i));
  const third = tones[type.tones.findIndex(([degree]) => degree === 3)];

  let best = null;
  for (let start = 1; start <= FRETS; start++) {
    const choices = STRINGS.map((string) => stringChoices(string.note, tones, start));
    for (const frets of combinations(choices)) {
      const score = scoreVoicing(frets, root, third, required);
      if (score !== null && (best === null || score < best.score)) best = { frets, score };
    }
  }
  return best && best.frets;
}

// Tones a guitarist usually leaves out when there aren't enough fingers or
// strings: the plain 5th of a chord with four or more notes, and the 9th of
// an 11th or 13th chord. So m11 can be played as 1 ♭3 ♭7 11, and 13 as
// 1 3 ♭7 13. A ♭5 stays, since it's what makes m7♭5 sound diminished.
function optional(type, i) {
  const [degree, semitones] = type.tones[i];
  if (degree === 5 && semitones === 7) return type.tones.length >= 4;
  if (degree === 9) return type.tones.some(([d]) => d === 11 || d === 13);
  return false;
}

function soundingNote(string, fret) {
  return (STRINGS[string].note + fret) % NOTES.length;
}

// What one string can do with the hand at `start`: be muted, ring open, or
// be fretted within reach, but only on notes of the chord.
function stringChoices(openNote, tones, start) {
  const choices = [MUTED];
  for (let fret = 0; fret <= FRETS; fret++) {
    const inReach = fret === 0 || (fret >= start && fret < start + REACH);
    if (inReach && tones.includes((openNote + fret) % NOTES.length)) choices.push(fret);
  }
  return choices;
}

// Every way to pick one choice per string.
function* combinations(choices, picked = []) {
  if (picked.length === choices.length) {
    yield picked;
    return;
  }
  for (const choice of choices[picked.length]) yield* combinations(choices, [...picked, choice]);
}

// How hard a voicing is (lower is easier), or null if it can't be played
// or isn't the chord in root position.
function scoreVoicing(frets, root, third, required) {
  const sounded = frets.flatMap((fret, i) => (fret === MUTED ? [] : [i]));
  if (sounded.length < 3) return null;
  const lowest = sounded[0];
  const highest = sounded[sounded.length - 1];
  if (soundingNote(lowest, frets[lowest]) !== root) return null;
  const heard = sounded.map((i) => soundingNote(i, frets[i]));
  if (!required.every((tone) => heard.includes(tone))) return null;

  const fretted = frets.filter((fret) => fret > 0);
  const low = fretted.length ? Math.min(...fretted) : 0;
  const span = fretted.length ? Math.max(...fretted) - low : 0;
  const { barre, fingers } = fingering(frets);
  const fingerCount = fingers.length + (barre ? 1 : 0);
  if (fingerCount > 4) return null;

  // Strings skipped in the middle of a chord are hard to keep quiet.
  const innerMutes = frets.filter((fret, i) => fret === MUTED && i > lowest && i < highest).length;
  const outerMutes = frets.filter((fret) => fret === MUTED).length - innerMutes;
  // Open strings make a chord easy near the nut, but mixed with notes
  // further up the neck they force an awkward stretch.
  const opens = frets.filter((fret) => fret === 0).length;
  const openCost = low + span >= 4 ? 3 : -0.5;
  // A doubled 3rd sounds muddy, so guitarists avoid it.
  const thirds = heard.filter((tone) => tone === third).length;

  // The first few frets are all easy to reach; past them, each fret costs more.
  const position = low <= 3 ? low : 2 * low - 3;
  // More strings sound fuller, but only up to two of each note: E5 is
  // E B E on the three lowest strings, not every E and B on the neck.
  return position + 2 * span + (span >= 3 ? 2 : 0) + 8 * innerMutes + 1.5 * outerMutes +
    opens * openCost + Math.max(0, thirds - 1) + (barre ? 1 : 0) + 0.5 * fingerCount -
    Math.min(sounded.length, 2 * new Set(heard).size);
}

// Which fingers press which strings. With more than four fretted notes,
// the index finger lies flat across one fret as a barre: F is 1 3 3 2 1 1,
// a barre at fret 1 plus three fingers. The barre doesn't have to be on the
// lowest fret: C9 is x 3 2 3 3 3, a barre at fret 3 across the top three
// strings with fingers on the A and D strings. A barre can't cross a string
// that rings open or is fretted lower than it.
//
// `thumb` is a string the thumb frets from over the top of the neck (only
// ever the low E, from alternates.js), which leaves the four fingers free:
// Fmaj7 as T1 3 3 2 1 0 is the thumb plus three fingers, not a barre.
export function fingering(frets, thumb = null) {
  const thumbed = thumb === null ? null : { string: thumb, fret: frets[thumb] };
  const fretted = frets.flatMap((fret, string) => (fret > 0 && string !== thumb ? [{ string, fret }] : []));
  let best = { barre: null, thumb: thumbed, fingers: fretted };
  if (fretted.length <= 4) return best;

  const count = ({ barre, fingers }) => fingers.length + (barre ? 1 : 0);
  const barreFrets = [...new Set(fretted.map(({ fret }) => fret))].sort((a, b) => a - b);
  for (const fret of barreFrets) {
    // Stretches of neighboring strings a finger at `fret` can lie across.
    const runs = [[]];
    frets.forEach((f, string) => {
      if (string !== thumb && (f === MUTED || f >= fret)) runs[runs.length - 1].push(string);
      else runs.push([]);
    });
    for (const run of runs) {
      const covered = run.filter((string) => frets[string] === fret);
      if (covered.length < 2) continue;
      const barre = { fret, from: covered[0], to: covered[covered.length - 1] };
      const fingers = fretted.filter(({ string, fret: f }) =>
        f !== fret || string < barre.from || string > barre.to);
      // The lowest barre that leaves enough fingers is the usual one (the
      // index finger): C is x 3 5 5 5 3, a barre at fret 3 with three
      // fingers at fret 5, not a barre at 5 with fingers at 3.
      if (count({ barre, fingers }) <= 4) return { barre, thumb: thumbed, fingers };
      if (count({ barre, fingers }) < count(best)) best = { barre, thumb: thumbed, fingers };
    }
  }
  return best;
}
