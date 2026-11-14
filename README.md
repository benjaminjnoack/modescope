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

### Selecting a note

- **Click a note** on the outer ring to select it. It gets a blue outline. A note is always selected, and the page starts with the top note.
- **Click a selected black key again** to switch its spelling, for example C♯ ↔ D♭. The chosen spelling is used everywhere that note is named.

### Chord panel

For the selected note, the panel lists the chords on it in each parallel mode of the current tonic. The current mode is at the top, and the rest follow in order (Ionian → Dorian → …). A chord is listed in a mode only when every one of its notes is in that mode. For example, with C as the tonic, D is listed in C Ionian (Dm) and in C Lydian (D).

These chord types are included:

| Group | Chords |
|---|---|
| Triads | major, m, ° |
| Power chord | 5 |
| Suspended | sus2, sus4 |
| 7ths | 7, maj7, m7, m7♭5 |
| 9ths | 9, maj9, m9 |
| 11ths | m11 |
| 13ths | 13, maj13 (without the 11th) |

### Chord spelling

Under the wheel, the chosen chord is spelled out note by note. It starts as the first chord in the panel; clicking a chord in the panel spells that one instead. The chord you clicked is shown in black, and the same chord in other modes is shown in gray.

- **Letters:** each chord tone gets its own letter, so D♭m is D♭ F♭ A♭, not D♭ E A♭.
- **Degree numbers:** the numbers under each note are scale degrees counted from the tonic of the mode the chord was chosen from, not from the chord's root. D in C Lydian reads 2 ♯4 6 rather than 1 3 5.

### Tooltips

Hover over the heading under the wheel, the degree numbers, the Roman numerals or the chord buttons for an explanation of each term.

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
        ├── state.js     Key, mode, lock and selection state
        ├── svg.js       SVG geometry and element helpers
        ├── ring.js      A reusable ring of labeled segments
        ├── drag.js      Drag-to-rotate with snapping and click detection
        └── main.js      Builds the page and redraws it when the state changes
```

## Extending it

- **Add a chord type:** add an entry to `CHORD_TYPES` in `music.js`, with its suffix, a name for the tooltip and its tones as `[degree, semitones above the root]`. It's then listed, spelled and explained automatically.
- **Change a mode's Roman numerals or description:** edit `MODES` in `music.js`.
- **Change colors or fonts:** edit `styles.css`. Segments use the classes `selected` (gold) and `in-mode` (light yellow).
- **Change tooltip wording:** edit `tooltips.js`.

## License

[MIT](LICENSE)
