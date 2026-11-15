// Hand-picked guitar voicings. No DOM code here.
//
// A chord's voicings are shown in this order, and the first is the one you
// see when you pick the chord; the ‹ › arrows step through the rest:
// 1. PREFERRED: voicings the project's owner chose.
// 2. SUGGESTED: common shapes Claude added from memory.
// 3. The voicing guitar.js works out itself, as a fallback.
//
// Each key is a chord name (root and CHORD_TYPES suffix). Enharmonic roots
// are the same chord, so "B♭m" also covers A♯m. Each voicing lists the
// frets from the low E string to the high e: "x" is muted, "0" open. Write
// it as six characters ("x32010") or, when a fret is 10 or higher, as
// numbers separated by spaces ("8 10 10 9 8 8"). Frets go up to 12.
// Barres and note names are worked out automatically. A voicing listed
// twice is shown once, at its first place, and one with a note outside the
// chord is ignored: run checkAlternates() from guitar.js to find those.

export const PREFERRED = {
  "Gm": ["355333"],
};

// Where a chord has a well-known open shape, it's listed first so it stays
// the default, and the barre shapes up the neck come after it.
export const SUGGESTED = {
  // Major: barre chords on the E and A strings.
  "C": ["x32010", "x35553", "8 10 10 9 8 8"],
  "D": ["xx0232", "x57775"],
  "E": ["022100", "x 7 9 9 9 7"],
  "G": ["320003", "320033", "355433"],
  "A": ["x02220", "577655"],
  "F": ["133211", "xx3211"],

  // Minor
  "Cm": ["x35543"],
  "Dm": ["xx0231", "x57765"],
  "Em": ["022000", "x 7 9 9 8 7"],
  "Am": ["x02210", "577555"],

  // Dominant 7th
  "C7": ["x32310", "x35353"],
  "D7": ["xx0212", "x57575"],
  "E7": ["020100", "022130", "x 7 9 7 9 7"],
  "G7": ["320001", "353433"],
  "A7": ["x02020", "x02223", "575685"],

  // Major 7th
  "Cmaj7": ["x32000", "x35453"],
  "Fmaj7": ["xx3210", "1x221x"],
  "Gmaj7": ["3x443x"],

  // Minor 7th and half-diminished
  "Am7": ["x02010", "575555"],
  "Dm7": ["x57565"],
  "Em7": ["020000", "022030"],
  "Bm7": ["x24232"],
  "Bm7♭5": ["x2323x"],

  // 6ths
  "C6": ["x32210", "x32253"],

  // Suspended
  "Dsus2": ["xx0230", "x57755"],
  "Dsus4": ["xx0233", "x5778x"],
  "Esus4": ["022200"],
  "Asus4": ["x02230"],

  // 9ths
  "C9": ["x32333"],
  "E9": ["020102", "076777"],
  "A9": ["x02423"],
};
