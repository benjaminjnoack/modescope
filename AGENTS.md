# AGENTS.md

Modescope is a single-page, dependency-free web app: an SVG wheel for exploring the seven diatonic modes and the chords in them. `README.md` describes the user-facing behavior in detail; read it before changing behavior, and keep it in sync when you do.

`ABOUT.md` explains why the project exists and what it's for: showing the modes as one rotating ring, and making modal interchange (borrowed chords) visible. Use its goals to judge whether a change fits. Prefer changes that make those ideas clearer over adding features.

## Running

```
npm start            # node server.js, serves public/ at http://localhost:3000
PORT=8080 npm start
```

- `server.js` is a dev-only static server that injects a live-reload snippet into HTML and reloads the page on any change under `public/`. Changes to `server.js` itself need a restart.
- There is no build step, no bundler, no `node_modules`, no linter and no test suite. Don't add dependencies, a build, or tooling unless asked.
- To check a change, run the server and use the page. For pure logic in `music.js` / `tooltips.js` you can also import them from Node in a scratch script (they are ES modules with no DOM access).

## Deployment

Every push to `master` deploys `public/` to GitHub Pages (`.github/workflows/pages.yml`). Anything outside `public/` is not shipped, so the app must work as plain static files: use relative paths and don't depend on `server.js`.

## Code layout

All browser code is in `public/js/`, loaded as native ES modules from `index.html` (`js/main.js` is the entry).

| File | Role |
|---|---|
| `music.js` | Theory data and pure functions: `NOTES`, `MODES`, `CHORD_TYPES`, `spellChord`, `scaleDegree`, `chordsOn`, `modeOffsetSemitones`. **No DOM.** |
| `tooltips.js` | Builds tooltip strings. **No DOM.** |
| `state.js` | Module-level state (ring rotations, lock, selected note/spelling/chord) behind getter/setter functions. |
| `svg.js` | SVG helpers and wheel geometry. |
| `ring.js` | `createRing` — a ring of labeled segments with `layout`, `indexOf`, `setLabel`. |
| `drag.js` | `makeDraggable` — rotate-by-drag with snapping and tap detection via pointer events. |
| `main.js` | Grabs DOM elements, wires events, and `render()`s everything from state. |
| `styles.css` | All styling. State is expressed with classes (`selected`, `in-mode`, `locked`, `current`, `absent`, `spelled`, `same-chord`, `dragging`). |

## How it works

- **Render model:** there is no framework. Every interaction updates `state.js` then calls `render()`, which rebuilds the numerals, chord panel and spelled chord with `replaceChildren`. Keep it that way: derive the UI from state rather than patching DOM incrementally.
- **Notes are indexes 0–11** into `NOTES` (C = 0). Names with two spellings are stored as `"C♯/D♭"`; `spellings(i)` splits them, and `state.noteName(i)` returns the chosen spelling for the selected note and both for the others.
- **Angles:** degrees, 0 = straight up, clockwise (`svg.point`). The SVG viewBox is centered on the origin.
- **Rotation state:** `state.js` stores `parentRotation` (the parent major key) and `modeRotation`. The note ring's rotation is *derived* (`getNoteRotation`) so spinning the mode ring carries the notes along (relative modes). When the note ring is locked, `setModeRotation` compensates `parentRotation` to keep the tonic fixed (parallel modes). Rotations are continuous while dragging and snap to `NOTE_STEP` / `MODE_STEP` on release; `modeOffsetSemitones` interpolates fractional positions so dragging is smooth.
- **Spelling:** chords are spelled by degree, so each chord tone gets its own letter (D♭m = D♭ F♭ A♭). Degree labels under the spelled chord are counted from the mode's tonic, not the chord root, and compared against the tonic's major scale.
- **Double-click** on the note ring toggles the lock; `main.js` undoes the selection changes from the double-click's two taps using `recentSelections`.

## Conventions and gotchas

- Use the real Unicode symbols `♯`, `♭`, `°` everywhere (data, labels, tooltips), never `#`/`b`. `parseNote` and the tooltip regexes rely on them.
- Order in `CHORD_TYPES` matters: the triads must stay first, because `main.js` uses `chordsOn(...).chords[0]` as the chord a Roman numeral stands for.
- `MODES` is in parent-major-scale order (Ionian … Locrian); `modeOffsetSemitones` and the mode ring depend on that. Each mode's `numerals` must match the qualities its `intervals` produce.
- Adding a chord type is only a `CHORD_TYPES` entry (`suffix`, `name`, `tones` as `[degree, semitones]`); listing, spelling and tooltips follow automatically. Degrees used must exist in `MAJOR_DEGREES` in `music.js`.
- Keep `music.js` and `tooltips.js` free of DOM code.
- Style: 2-space indent, double quotes, semicolons, `const`/arrow functions, small focused modules. Comments explain intent in plain English, often with a concrete musical example (e.g. "in C Lydian, D is D F♯ A: 2 ♯4 6"); follow that style.
- Tooltips use native `title` attributes (and `<title>` inside SVG). Wording is plain, beginner-friendly English.
- Commit messages are short and imperative; the project works directly on `master`.
