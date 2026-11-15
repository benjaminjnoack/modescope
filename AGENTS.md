# AGENTS.md

Modescope is a single-page, dependency-free web app: an SVG wheel for exploring the seven diatonic modes and the chords in them. `GUIDE.md` describes the user-facing behavior in detail, for players (no code names or file paths); read it before changing behavior, and keep it in sync when you do. `README.md` is for developers: running, deployment, project structure, extending. The toolbar at the top of the page links to `GUIDE.md` and `ABOUT.md` on GitHub.

`ABOUT.md` explains why the project exists and what it's for: showing the modes as one rotating ring, and making modal interchange (borrowed chords) visible. Use its goals to judge whether a change fits. Prefer changes that make those ideas clearer over adding features.

## Running

```sh
npm start            # node server.js, serves public/ at http://localhost:3000
PORT=8080 npm start
```

- `server.js` is a dev-only static server that injects a live-reload snippet into HTML and reloads the page on any change under `public/`. The snippet also shows JavaScript errors in a red box at the top of the page, for testing on a phone (open `http://<this machine's IP>:3000` on the same Wi-Fi). Changes to `server.js` itself need a restart.
- There is no build step, no bundler and no test suite. The only dependencies are dev-only linters (`npm install` once, which also turns on the pre-commit hook); the app in `public/` has no runtime dependencies. Don't add more dependencies, a build, or tooling unless asked.
- To check a change, run the server and use the page. For pure logic in `music.js` / `tooltips.js` you can also import them from Node in a scratch script (they are ES modules with no DOM access).
- **Before you call a change done, run `npm run lint` and fix everything it reports** (`npm run lint:fix` handles most of it). It checks every HTML, CSS, JS and Markdown file that isn't gitignored, using ESLint, Stylelint, html-validate and markdownlint. The pre-commit hook (`.githooks/pre-commit`) runs the same check. Don't get around it with `--no-verify` or by turning rules off unless asked.

## Deployment

Every push to `master` deploys `public/` to GitHub Pages (`.github/workflows/pages.yml`). Anything outside `public/` is not shipped, so the app must work as plain static files: use relative paths and don't depend on `server.js`. The workflow also stamps `public/sw.js` with the commit (`const VERSION = "dev";` becomes the short SHA), so each deploy replaces the offline copy that home-screen installs keep; don't reformat that line.

## Code layout

All browser code is in `public/js/`, loaded as native ES modules from `index.html` (`js/main.js` is the entry). Next to `index.html` are `manifest.webmanifest` (name, colors and icons for Add to Home Screen), `sw.js` (the service worker that caches every file for offline use) and `icons/` (`icon.svg` is the source; `scripts/icons.sh` exports the PNGs with `rsvg-convert` and `optipng`, and they're committed). Linting lives outside `public/`: `scripts/lint.js` runs the linters on the files git lists, configured by `eslint.config.mjs`, `.stylelintrc.json`, `.htmlvalidate.json` and `.markdownlint-cli2.jsonc`.

| File | Role |
|---|---|
| `music.js` | Theory data and pure functions: `NOTES`, `MODES`, `CHORD_TYPES`, `CHORD_FAMILIES`/`chordFamily` (the chord table's columns), `spellChord`, `scaleDegree`, `chordsOn`, `modeOffsetSemitones`. **No DOM.** |
| `tooltips.js` | Builds tooltip strings. **No DOM.** |
| `guitar.js` | Guitar voicings for a chord (`voicingsFor`): the hand-picked ones, then the easiest root-position fingering found by searching the neck. Finds barres (`fingering`) and validates alternates (`checkAlternates`). Memoized. **No DOM.** |
| `alternates.js` | `PREFERRED` (the user's) and `SUGGESTED` (Claude's) guitar voicings, keyed by chord name. Data only. **No DOM.** |
| `fretboard.js` | `renderFretboard` — draws the guitar neck for a voicing: lying down (nut left, high e on top), or with `vertical` (phones in portrait) turned a quarter turn into a chord chart (nut on top, low E left) with shorter frets. |
| `state.js` | Module-level state (ring rotations, lock, selected note/spelling/chord, which guitar voicing is shown, the open explanation on touch screens) behind getter/setter functions. |
| `svg.js` | SVG helpers and wheel geometry. |
| `ring.js` | `createRing` — a ring of labeled segments with `layout`, `indexOf`, `setLabel`. |
| `drag.js` | `makeDraggable` — rotate-by-drag with snapping and tap detection via pointer events. |
| `main.js` | Grabs DOM elements, wires events, and `render()`s everything from state. |
| `explain.js` | Touch screens, which don't show tooltips: tapping a term, or holding a button, puts its tooltip text in `state.explanation()`, which `render()` shows in a panel at the bottom. Reads the `title`s already on the page. |
| `theme.js` | Light/dark theme: follows the system until the theme button is pressed, then remembers the choice in `localStorage`. Sets `data-theme` on `<html>`, and the `theme-color` meta to `--bg` for the home-screen app's status bar. |
| `offline.js` | Registers `sw.js` so the installed app opens offline. Only over HTTPS (or with `?sw` in the URL), so the dev server's live reload isn't served from a cache. |
| `styles.css` | All styling. Colors are custom properties on `:root`, redefined for the dark theme (both under `prefers-color-scheme` and `[data-theme="dark"]`; keep the two in sync). Each mode has a color, `--mode-0` (Ionian) … `--mode-6`; a `mode-N` class sets `--mode` for an element. State is expressed with classes (`selected`, `in-mode`, `locked`, `current`, `absent`, `spelled`, `same-chord`, `dragging`). |

## How it works

- **Render model:** there is no framework. Every interaction updates `state.js` then calls `render()`, which rebuilds the numerals, chord panel and spelled chord with `replaceChildren`. Keep it that way: derive the UI from state rather than patching DOM incrementally.
- **Notes are indexes 0–11** into `NOTES` (C = 0). Names with two spellings are stored as `"C♯/D♭"`; `spellings(i)` splits them, and `state.noteName(i)` spells notes of the current mode from the scale (`spellScale`, each letter once, so F♯ Ionian has E♯), and for notes outside it returns the chosen spelling when selected and both otherwise. `state.tonicName()` is the tonic's spelling: derived from `selection.keySpelling` (the chosen spelling of the *parent major key*, so it survives turning the mode ring), or else `defaultTonicName` (fewest accidentals). The chord panel spells the selected note with each parallel mode's own letters.
- **Key signatures** are signed counts (2 = two sharps, -4 = four flats) computed from a spelled scale (`keySignature`). `state.setKeySignature` turns the note ring to the signature's parent key when unlocked, or picks the mode on the tonic with that signature when locked (`modeForSignature`).
- **Angles:** degrees, 0 = straight up, clockwise (`svg.point`). The SVG viewBox is centered on the origin.
- **Rotation state:** `state.js` stores `parentRotation` (the parent major key) and `modeRotation`. The note ring's rotation is *derived* (`getNoteRotation`) so spinning the mode ring carries the notes along (relative modes). When the note ring is locked, `setModeRotation` compensates `parentRotation` to keep the tonic fixed (parallel modes). Rotations are continuous while dragging and snap to `NOTE_STEP` / `MODE_STEP` on release; `modeOffsetSemitones` interpolates fractional positions so dragging is smooth.
- **Spelling:** chords are spelled by degree, so each chord tone gets its own letter (D♭m = D♭ F♭ A♭). Degree labels under the spelled chord are counted from the mode's tonic, not the chord root, and compared against the tonic's major scale.
- **Lock:** the toolbar's Relative/Parallel switch sets the lock, and a **double-click** on the note ring toggles it; `main.js` undoes the selection changes from the double-click's two taps using `recentSelections`.

## Conventions and gotchas

- Use the real Unicode symbols `♯`, `♭`, `°` everywhere (data, labels, tooltips), never `#`/`b`. `parseNote` and the tooltip regexes rely on them.
- Order in `CHORD_TYPES` matters: the triads must stay first, because `main.js` uses `chordsOn(...).chords[0]` as the chord a Roman numeral stands for.
- `MODES` is in parent-major-scale order (Ionian … Locrian); `modeOffsetSemitones` and the mode ring depend on that. Each mode's `numerals` must match the qualities its `intervals` produce.
- Adding a chord type is only a `CHORD_TYPES` entry (`suffix`, `name`, `tones` as `[degree, semitones]`); listing, spelling, tooltips and the guitar voicing follow automatically, and `chordFamily` puts it in a column of the chord table from its tones. Guitar voicings come from the weights in `scoreVoicing` (`guitar.js`); if you change them, print the voicing of every root × chord type from Node and check familiar shapes (C x32010, F 133211, Bm x24432, D7 xx0212) still win. Degrees used must exist in `MAJOR_DEGREES` in `music.js`.
- Keep `music.js`, `tooltips.js`, `guitar.js` and `alternates.js` free of DOM code.
- Style: 2-space indent, double quotes, semicolons, `const`/arrow functions, small focused modules. Comments explain intent in plain English, often with a concrete musical example (e.g. "in C Lydian, D is D F♯ A: 2 ♯4 6"); follow that style.
- Tooltips use native `title` attributes (and `<title>` inside SVG). Wording is plain, beginner-friendly English. On touch screens `explain.js` shows the same text, so a new tooltip needs nothing extra.
- Every file in `public/` must be listed in `FILES` in `public/sw.js`, or it's missing when the installed app is offline. `npm run lint` checks this.
- Phones (`width <= 600px`, the same query in `styles.css` and `main.js`) get their own layout rather than a squeezed desktop one: the toolbar's controls stay pinned at the top, the panels stack in one scrolling column, and the guitar neck stands upright.
- Commit messages are short and imperative; the project works directly on `master`.

## Guitar voicings

The guitar at the bottom of the page shows the chosen chord. `voicingsFor` (`guitar.js`) lists its voicings in order of precedence, and the first is shown by default; the ‹ › arrows beside "On guitar" in the chosen chord card cycle through the rest (wrapping around, disabled when there's only one):

1. `PREFERRED` in `public/js/alternates.js`: voicings the user specified.
2. `SUGGESTED` in the same file: common shapes Claude added from memory. Where a chord has a well-known open shape it's listed first, so it stays the default, with barre shapes after it.
3. The shape the scoring formula in `guitar.js` works out, as a fallback.

A voicing that appears more than once is shown once, at its first place. The shown index is per chord (`state.guitarVoicingIndex`), so picking another chord starts again at the first.

When the user gives a voicing ("use 355333 for Gm"), add it to `PREFERRED`, in the order they want. When asked to suggest voicings (e.g. "alternates for A9"), propose them first, then add the ones they accept to `SUGGESTED`:

- Key by chord name, root plus a `CHORD_TYPES` suffix: `"A9": ["x02423"]`. Use `♯`/`♭`; one entry covers both spellings of a root (`"B♭m"` is also A♯m).
- Write frets low E to high e, `x` muted, `0` open: six characters (`"x02423"`), or space-separated when any fret is 10+ (`"8 10 10 9 8 8"`). Frets 0–12 only, since the neck stops at 12.
- Only standard, commonly taught shapes you're confident of: barre chords on the E and A strings, open-position variants, common jazz voicings. Every string must play a chord tone. Inversions are allowed but say so when suggesting them.
- Mind the order: the first entry becomes the chord's default. Don't put a barre shape ahead of the familiar open chord unless asked.
- Verify: `node -e 'import("./public/js/guitar.js").then((g) => console.log(g.checkAlternates()))'` must print `[]` (it catches non-chord tones, wrong string count, frets out of range and shapes needing more than four fingers). Then print `voicingsFor(root, chordType(suffix))` to see the order and barres for the chord.
- Barres are detected, not written: `fingering` uses the lowest fret where one finger can cover 2+ strings and leave ≤ 4 fingers in all, and only when more than four strings are fretted.
