// Hand-picked guitar voicings, shown after the computed one (guitar.js)
// when you step through a chord's voicings with the arrows. No DOM code.
//
// Each key is a chord name (root and CHORD_TYPES suffix). Enharmonic roots
// are the same chord, so "B♭m" also covers A♯m. Each voicing lists the
// frets from the low E string to the high e: "x" is muted, "0" open. Write
// it as six characters ("x32010") or, when a fret is 10 or higher, as
// numbers separated by spaces ("8 10 10 9 8 8"). Frets go up to 12.
// Barres and note names are worked out automatically. A voicing that
// matches the computed one is skipped, and one with a note outside the
// chord is ignored: run checkAlternates() from guitar.js to find those.
export const ALTERNATES = {
  // Major: barre chords on the E and A strings.
  "C": ["x35553", "8 10 10 9 8 8"],
  "D": ["x57775"],
  "E": ["x 7 9 9 9 7"],
  "G": ["355433", "320033"],
  "A": ["577655"],
  "F": ["xx3211"],

  // Minor
  "Cm": ["x35543"],
  "Dm": ["x57765"],
  "Em": ["x 7 9 9 8 7"],
  "Gm": ["355333"],
  "Am": ["577555"],

  // Dominant 7th
  "C7": ["x35353"],
  "D7": ["x57575"],
  "E7": ["022130", "x 7 9 7 9 7"],
  "G7": ["353433"],
  "A7": ["x02223", "575685"],

  // Major 7th
  "Cmaj7": ["x35453"],
  "Fmaj7": ["xx3210", "1x221x"],
  "Gmaj7": ["3x443x"],

  // Minor 7th and half-diminished
  "Am7": ["575555"],
  "Dm7": ["x57565"],
  "Em7": ["022030"],
  "Bm7": ["x24232"],
  "Bm7♭5": ["x2323x"],

  // 6ths
  "C6": ["x32253"],

  // Suspended
  "Dsus2": ["x57755"],
  "Dsus4": ["x5778x"],
  "Esus4": ["022200"],
  "Asus4": ["x02230"],

  // 9ths
  "C9": ["x32333"],
  "E9": ["076777"],
  "A9": ["x02423"],
};
