// Tooltip text explaining music vocabulary. No DOM code here.

import { chordFormula } from "./music.js";

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
const DEGREE_NAMES = ["tonic", "supertonic", "mediant", "subdominant", "dominant", "submediant"];
const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };

// Traditional name of a scale degree, e.g. "supertonic". The 7th is the
// "leading tone" a half step below the tonic, or the "subtonic" a whole
// step below it.
function degreeName(number, accidental) {
  if (number === 7) return accidental === "♭" ? "subtonic" : "leading tone";
  return DEGREE_NAMES[number - 1];
}

// Split a degree label like "♯4" into its accidental and number.
function parseDegree(label) {
  const match = label.match(/^([♭♯]*)(\d+)$/);
  return { accidental: match[1], number: Number(match[2]) };
}

function alteredWord(accidental) {
  if (accidental.startsWith("♭")) return "lowered";
  if (accidental.startsWith("♯")) return "raised";
  return "";
}

// "D in C Lydian": the chord's root.
export function rootTip({ rootName, tonicName, mode, type, degreeLabels }) {
  const { accidental, number } = parseDegree(degreeLabels[0]);
  if (number === 1 && !accidental) {
    return `${rootName} is the tonic (1st degree) of ${tonicName} ${mode.name}, ` +
      `so the numbers under each note match the chord's formula: ${chordFormula(type)}.`;
  }
  return `${rootName} is the ${ORDINALS[number - 1]} degree (${degreeName(number, accidental)}) ` +
    `of ${tonicName} ${mode.name}. The numbers under each note count scale degrees up from ` +
    `${tonicName}, not from ${rootName}, which is why they read ${degreeLabels.join(" ")} ` +
    `instead of the chord's own formula, ${chordFormula(type)}.`;
}

// "D in C Lydian": the chord quality (the part after the root).
export function chordTypeTip(chordName, type) {
  return `${chordName}: ${type.name}. Counted from its root: ${chordFormula(type)}.`;
}

// "D in C Lydian": the tonic.
export function tonicTip(tonicName, mode) {
  return `${tonicName} is the tonic of ${tonicName} ${mode.name}: degree 1, the note the ` +
    `mode is built on and feels like home.`;
}

// "D in C Lydian": the mode.
export function modeTip(mode) {
  return `${mode.name}: ${mode.description}.`;
}

// A degree label under a spelled note, e.g. "♯4".
export function degreeTip(noteName, label, tonicName, mode) {
  const { accidental, number } = parseDegree(label);
  const base = `${noteName} is the ${ORDINALS[number - 1]} degree ` +
    `(${degreeName(number, accidental)}) of ${tonicName} ${mode.name}.`;
  if (!accidental) return base;
  const halfSteps = accidental.length === 1 ? "a half step" : `${accidental.length} half steps`;
  return `${base} It's marked ${label} because it's ${halfSteps} ` +
    `${accidental.startsWith("♭") ? "below" : "above"} the ${ORDINALS[number - 1]} degree of ` +
    `${tonicName} major.`;
}

// A Roman numeral such as "♭VII" or "vi°". `chordName` (optional) names
// the chord it stands for in the current key, e.g. "Am".
export function numeralTip(numeral, tonicName, mode, chordName) {
  const match = numeral.match(/^([♭♯]?)([ivIV]+)(°?)$/);
  const [, accidental, roman, diminished] = match;
  const number = ROMAN[roman.toUpperCase()];
  const quality = diminished ? "diminished" : roman === roman.toUpperCase() ? "major" : "minor";
  const altered = alteredWord(accidental);
  const degree = `${altered ? altered + " " : ""}${ORDINALS[number - 1]} degree` +
    `${accidental ? ` (${accidental}${number})` : ""}`;
  return `${numeral}: the ${quality} chord built on the ${degree} of ${tonicName} ${mode.name}` +
    `${chordName ? `, which is ${chordName}` : ""}. ` +
    `Uppercase numerals are major chords, lowercase are minor, and ° marks diminished.`;
}

// "4 flats", "1 sharp", "no sharps or flats".
function signatureWords(count) {
  if (count === 0) return "no sharps or flats";
  const n = Math.abs(count);
  return `${n} ${count > 0 ? "sharp" : "flat"}${n === 1 ? "" : "s"}`;
}

// The key signature in the center of the wheel. `notes` are its sharps or
// flats in staff order, `relatives` every mode that shares it (e.g. "F Aeolian").
export function signatureTip(count, notes, relatives) {
  const which = count === 0 ? "" : ` (${notes.join(" ")})`;
  return `Key signature: ${signatureWords(count)}${which}. This is what a staff in a songbook ` +
    `shows at the start of each line. It only says which notes are used, so every mode with ` +
    `these notes shares it: ${relatives.join(", ")}. Turning the inner ring keeps the key ` +
    `signature and moves the tonic.`;
}

// A key signature button. `major` and `minor` are the major and minor keys
// with this signature (e.g. "A♭" and "F"). Unlocked, `target` is where the
// button goes (e.g. "F Aeolian"); locked, it's the mode on the tonic with
// this signature, or null if there isn't one.
export function signatureButtonTip({ count, major, minor, locked, target, tonicName }) {
  const base = `${signatureWords(count)[0].toUpperCase()}${signatureWords(count).slice(1)}: ` +
    `the key signature of ${major} major and ${minor} minor.`;
  if (!locked) return `${base} Click to use these notes and keep the mode: ${target}.`;
  if (!target) {
    return `${base} No mode on ${tonicName} has ${signatureWords(count)}. ` +
      `Double-click the outer ring to unlock it and change the key.`;
  }
  return `${base} The outer ring is locked, so ${tonicName} stays the tonic. ` +
    `Click to switch to the mode on ${tonicName} with this signature: ${target}.`;
}
