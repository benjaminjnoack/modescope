// Guitar fingerings, worked out from a chord's notes. No DOM code here.

import { chordFormula, noteIndex, spellChord, NOTES } from "./music.js";

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

// The easiest root-position way to play a chord, from its root's name and
// type, or null if there's no playable one. Returns:
// - frets: one per string, low E first; -1 is muted, 0 open.
// - notes: what each string plays, as { name, degree } spelled from the
//   chord (so D♭m's 3rd is F♭, not E), or null when muted.
// - barre: { fret, from, to } (string indexes) when one finger lies across
//   several strings, else null.
// - fingers: the other fretted notes, as { string, fret }.
export function voiceChord(rootName, type) {
  const key = `${rootName} ${type.suffix}`;
  if (!voicings.has(key)) voicings.set(key, findVoicing(rootName, type));
  return voicings.get(key);
}

function findVoicing(rootName, type) {
  const names = spellChord(rootName, type);
  const degrees = chordFormula(type).split(" ");
  const tones = names.map(noteIndex);
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
  if (!best) return null;

  const { frets } = best;
  const notes = frets.map((fret, i) => {
    if (fret === MUTED) return null;
    const tone = tones.indexOf(soundingNote(i, fret));
    return { name: names[tone], degree: degrees[tone] };
  });
  return { frets, notes, ...fingering(frets) };
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
// the index finger lies flat across the lowest fret as a barre: F is
// 1 3 3 2 1 1, a barre at fret 1 plus three fingers. A barre can't cross
// a string that rings open.
export function fingering(frets) {
  const fretted = frets.flatMap((fret, string) => (fret > 0 ? [{ string, fret }] : []));
  if (fretted.length <= 4) return { barre: null, fingers: fretted };

  const low = Math.min(...fretted.map(({ fret }) => fret));
  const onLow = fretted.filter(({ fret }) => fret === low).map(({ string }) => string);
  const from = onLow[0];
  const to = onLow[onLow.length - 1];
  const crossesOpen = frets.slice(from, to + 1).some((fret) => fret === 0);
  if (onLow.length < 2 || crossesOpen) return { barre: null, fingers: fretted };

  return {
    barre: { fret: low, from, to },
    fingers: fretted.filter(({ fret }) => fret !== low),
  };
}
