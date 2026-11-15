# Modescope

An interactive wheel for exploring the seven modes of the diatonic scale (Ionian through Locrian) and the chords in them.

Spin the wheel to change the key or mode, select a note to see which chords on it are in each parallel mode, and click a chord to spell it out with its scale degrees. Hover over terms to see what they mean.

**Live site:** https://benjaminjnoack.github.io/modescope/

## Running it

Requires [Node.js](https://nodejs.org/) (any recent version). There are no dependencies to install.

```
npm start
```

Then open http://localhost:3000. To use a different port, run `PORT=8080 npm start`.

The page reloads itself whenever a file in `public/` changes. Changes to `server.js` need a server restart.

## Using it

### The wheel

- **Outer ring (notes):** drag to change the key. The tonic sits under the **I** at the top and is gold. The other notes of the mode are light yellow.
- **Inner ring (modes):** drag to change the mode.
  - **Unlocked (default), relative modes:** the notes stay the same and the tonic moves. C Ionian becomes D Dorian, then E Phrygian, and so on.
  - **Locked, parallel modes:** the tonic stays the same and the notes change. C Ionian becomes C Dorian, then C Phrygian, and so on.
- **Double-click the outer ring** to lock or unlock it. A locked ring has a thick gray outline and can't be dragged.
- **Roman numerals** around the outside show the chord built on each degree of the mode. Uppercase numerals are major chords, lowercase are minor, and ° marks diminished.

### Key signature

The center of the wheel shows the key signature of the current scale, as the number of sharps or flats a staff would show (for example 4♭ for F Aeolian). A key signature only says which notes are used, so every mode with the same notes shares it: four flats is A♭ Ionian, B♭ Dorian, C Phrygian, F Aeolian and so on. Turning the inner ring while it's unlocked keeps the key signature and moves the tonic.

Under the wheel is a row of key signatures from 7♭ to 7♯. Use it to find a song from a songbook: pick the signature on its staff, then turn the inner ring until the tonic is the note that sounds like home.

- **Unlocked:** the outer ring turns to the signature's notes and the mode stays the same. From Aeolian, 4♭ goes to F Aeolian and 2♯ to B Aeolian.
- **Locked:** the tonic stays and the mode changes to the one with that signature. With C as the tonic, 4♭ goes to C Phrygian. Signatures that no mode on the tonic has are grayed out.
- 7♯ and 5♭ are the same notes, spelled differently (C♯ vs D♭ major), as are 6♯/6♭ and 5♯/7♭. The button you pick sets the spelling.

### Selecting a note

- **Click a note** on the outer ring to select it. It gets a blue outline. A note is always selected, and the page starts with the top note.
- **Note names follow the scale.** The notes of the mode use each letter A–G exactly once, so F Ionian shows B♭ (not A♯/B♭) and F♯ Ionian shows E♯ (not F). A black-key tonic gets the spelling with fewer accidentals, so D♭ Ionian rather than C♯ Ionian. Notes outside the mode show both names (C♯/D♭) and use the first one when selected.
- **Click a selected note again** to switch its spelling: a note outside the mode toggles C♯ ↔ D♭, and the tonic respells the whole scale (D♭ Ionian ↔ C♯ Ionian). The chosen spelling is used everywhere that note is named.

### Chord panel

For the selected note, the panel lists the chords on it in each parallel mode of the current tonic. The current mode is at the top, and the rest follow in order (Ionian → Dorian → …). A chord is listed in a mode only when every one of its notes is in that mode. Each mode spells the note with its own letters, so with G♯ as the tonic, C is listed as B♯m in G♯ Ionian. For example, with C as the tonic, D is listed in C Ionian (Dm) and in C Lydian (D).

These chord types are included:

| Group | Chords |
|---|---|
| Triads | major, m, ° |
| Power chord | 5 |
| Suspended | sus2, sus4 |
| 6ths | 6, m6 |
| 7ths | 7, maj7, m7, m7♭5 |
| 9ths | 9, maj9, m9 |
| 11ths | m11 |
| 13ths | 13, maj13 (without the 11th) |

### Chord spelling

Under the wheel, the chosen chord is spelled out note by note. It starts as the first chord in the panel; clicking a chord in the panel spells that one instead. The chord you clicked is shown in black, and the same chord in other modes is shown in gray.

- **Letters:** each chord tone gets its own letter, so D♭m is D♭ F♭ A♭, not D♭ E A♭.
- **Degree numbers:** the numbers under each note are scale degrees counted from the tonic of the mode the chord was chosen from, not from the chord's root. D in C Lydian reads 2 ♯4 6 rather than 1 3 5.

### Guitar

At the bottom of the page, the chosen chord is shown on a guitar neck in standard tuning (E A D G B E), lying on its side: the nut is on the left, the high e string is on top (as in guitar tab), and frets 1–12 run to the right.

- **Dots** are fingers. A **bar** is one finger lying flat across several strings at one fret (a barre chord).
- Left of the nut, **O** marks a string played open and **X** a string you don't play.
- Next to them is the **note each string sounds**, spelled as in the chord (D♭m shows F♭, not E).

When a chord has no hand-picked voicing, the fingering is worked out by the app: it's the easiest one it finds with the chord's root as the lowest note, no more than four fingers and a reach of four frets. Like most guitarists, it may leave out the 5th of a chord with four or more notes, and the 9th of an 11th or 13th chord (so a 13th chord can be just 1 3 ♭7 13).

Many chords also have hand-picked voicings, such as barre chords further up the neck. When a chord has more than one, the heading shows how many ("1 of 3") and the ‹ › arrows on either side step through them, in this order: voicings chosen for this project (`PREFERRED` in `alternates.js`, like Gm as a barre at the 3rd fret), then common shapes suggested by Claude (`SUGGESTED`), then the one the app works out. Picking another chord starts again from the first.

### Tooltips

Hover over the heading under the wheel, the degree numbers, the Roman numerals, the chord buttons or the guitar's strings, dots and heading for an explanation of each term.

## Deployment

Every push to `master` publishes `public/` to GitHub Pages, using the workflow in `.github/workflows/pages.yml`. `server.js` is only used for local development.

## Project structure

```
├── .github/workflows/
│   └── pages.yml      Deploys public/ to GitHub Pages
├── server.js          Static file server with live reload (no dependencies)
├── package.json
└── public/            Everything the browser loads
    ├── index.html     Markup
    ├── styles.css     All styling (colors, fonts, layout)
    └── js/            ES modules, loaded directly by the browser (no build step)
        ├── music.js     Notes, modes, chord types, spelling. No DOM code.
        ├── tooltips.js  Tooltip wording. No DOM code.
        ├── guitar.js    Guitar fingerings worked out for each chord. No DOM code.
        ├── alternates.js Hand-picked guitar voicings
        ├── fretboard.js Draws the guitar neck
        ├── state.js     Key, mode, lock and selection state
        ├── svg.js       SVG geometry and element helpers
        ├── ring.js      A reusable ring of labeled segments
        ├── drag.js      Drag-to-rotate with snapping and click detection
        └── main.js      Builds the page and redraws it when the state changes
```

## Extending it

- **Add a chord type:** add an entry to `CHORD_TYPES` in `music.js`, with its suffix, a name for the tooltip and its tones as `[degree, semitones above the root]`. It's then listed, spelled, explained and fingered on the guitar automatically.
- **Change a mode's Roman numerals or description:** edit `MODES` in `music.js`.
- **Change colors or fonts:** edit `styles.css`. Segments use the classes `selected` (gold) and `in-mode` (light yellow).
- **Add a guitar voicing:** add it to `PREFERRED` in `alternates.js` (it's then shown first), e.g. `"A9": ["x02423"]` (frets from low E to high e, `x` for muted). Check it with `node -e 'import("./public/js/guitar.js").then((g) => console.log(g.checkAlternates()))'`, which should print `[]`.
- **Change tooltip wording:** edit `tooltips.js`.

## License

[MIT](LICENSE)
