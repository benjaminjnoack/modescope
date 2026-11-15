# Modescope

An interactive wheel for exploring the seven modes of the diatonic scale (Ionian through Locrian) and the chords in them.

Spin the wheel to change the key or mode, select a note to see which chords on it are in each parallel mode, and click a chord to spell it out with its scale degrees and see it on a guitar neck. Hover over terms to see what they mean.

**Live site:** <https://benjaminjnoack.github.io/modescope/>

## Running it

Requires [Node.js](https://nodejs.org/) (any recent version). The app itself has no dependencies.

```sh
npm start
```

Then open <http://localhost:3000>. To use a different port, run `PORT=8080 npm start`.

The page reloads itself whenever a file in `public/` changes. Changes to `server.js` need a server restart.

### Linting

```sh
npm install        # installs the linters and turns on the pre-commit hook
npm run lint       # checks HTML, CSS, JS and Markdown
npm run lint:fix   # fixes what can be fixed automatically
```

ESLint, Stylelint, html-validate and markdownlint check every file git tracks or would track, so anything gitignored is skipped. The pre-commit hook runs `npm run lint` and blocks the commit if it fails. The linters are dev-only and nothing they need is deployed.

## Using it

See [GUIDE.md](GUIDE.md) for how to use the site: the wheel, key signatures, the chord panel, chord spelling and the guitar. It's written for players and is linked from the bottom of the page.

When the guitar shows a chord, its voicings come in this order: `PREFERRED` in `public/js/alternates.js` (chosen for this project), then `SUGGESTED` (common shapes added by Claude), then the one `guitar.js` works out.

## Mobile

[MOBILE.md](MOBILE.md) plans the path, in stages, from this web page to an iPhone app without a Mac.

## Deployment

Every push to `master` publishes `public/` to GitHub Pages, using the workflow in `.github/workflows/pages.yml`. `server.js` is only used for local development.

## Project structure

```text
├── .github/workflows/
│   └── pages.yml      Deploys public/ to GitHub Pages
├── .githooks/
│   └── pre-commit     Runs npm run lint before each commit
├── scripts/
│   └── lint.js        Runs each linter on the files git lists
├── eslint.config.mjs, .stylelintrc.json, .htmlvalidate.json, .markdownlint-cli2.jsonc
│                      Linter settings
├── GUIDE.md           How to use the site, for players (linked from the page)
├── ABOUT.md           Why the project exists and its goals
├── MOBILE.md          Staged plan for getting the app onto iPhone
├── server.js          Static file server with live reload (no dependencies)
├── package.json       Scripts and dev-only linter dependencies
└── public/            Everything the browser loads
    ├── index.html     Markup
    ├── styles.css     All styling (colors, fonts, layout, light and dark themes)
    └── js/            ES modules, loaded directly by the browser (no build step)
        ├── music.js     Notes, modes, chord types, spelling. No DOM code.
        ├── tooltips.js  Tooltip wording. No DOM code.
        ├── guitar.js    Guitar fingerings worked out for each chord. No DOM code.
        ├── alternates.js Hand-picked guitar voicings
        ├── fretboard.js Draws the guitar neck
        ├── state.js     Key, mode, lock and selection state
        ├── theme.js     Light and dark theme switch
        ├── svg.js       SVG geometry and element helpers
        ├── ring.js      A reusable ring of labeled segments
        ├── drag.js      Drag-to-rotate with snapping and click detection
        └── main.js      Builds the page and redraws it when the state changes
```

## Extending it

- **Add a chord type:** add an entry to `CHORD_TYPES` in `music.js`, with its suffix, a name for the tooltip and its tones as `[degree, semitones above the root]`. It's then listed, spelled, explained and fingered on the guitar automatically.
- **Change a mode's Roman numerals or description:** edit `MODES` in `music.js`.
- **Change colors or fonts:** edit the custom properties at the top of `styles.css`. Each color is defined once for the light theme and again for the dark theme (in two places that must match: the `prefers-color-scheme` block and `[data-theme="dark"]`). The modes' colors are `--mode-0` (Ionian) to `--mode-6` (Locrian).
- **Add a guitar voicing:** add it to `PREFERRED` in `alternates.js` (it's then shown first), e.g. `"A9": ["x02423"]` (frets from low E to high e, `x` for muted). Check it with `node -e 'import("./public/js/guitar.js").then((g) => console.log(g.checkAlternates()))'`, which should print `[]`.
- **Change tooltip wording:** edit `tooltips.js`.

## License

[MIT](LICENSE)
