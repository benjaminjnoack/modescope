# Modescope on iPhone

This is the plan for getting Modescope onto an iPhone, in stages, starting from the web page it is today. The main constraint is that there is no Mac: everything here is done from Linux, with GitHub Actions' macOS runners doing the parts that need Apple's tools.

Each stage ends with something usable. A later stage is only worth starting if the earlier one feels limiting, so it's fine to stop after any of them.

| Stage | What you get | Cost | Needs a Mac? | Needs a developer account? |
|---|---|---|---|---|
| 1. Mobile-friendly layout | The live site works well in Safari on a phone | Free | No | No |
| 2. Installable web app (PWA) | A home-screen icon that opens full screen and works offline | Free | No | No |
| 3. Capacitor app | A real iOS app, installed through TestFlight, with haptics | $99/year | No (GitHub Actions builds it) | Yes |
| 4. Native SwiftUI app | A rewrite in Swift, for whatever the web view can't do | $99/year, plus a lot of time | No, but a rented Mac helps | Yes |

## Stage 1: Mobile-friendly layout

**Status:** done. Phones get their own layout: the controls pinned at the top, the panels stacked in one scrolling column, and the guitar neck upright in portrait. Tapping a term (or holding a button) shows its explanation in a panel.

**Goal:** every feature is reachable and readable on an iPhone held upright, on the live site.

### Where things stand today

- `index.html` already has a viewport meta tag, and dragging the rings already works on touch: `drag.js` uses pointer events and the rings have `touch-action: none`.
- `styles.css` has no width breakpoints. The layout is flex-wrap with a 1220px maximum; the wheel is capped at 440px; the chord table has 15 columns; the guitar neck is a 900 × 200 SVG.
- Every explanation is a native `title` tooltip (or `<title>` inside the SVG). **iOS never shows these**, so on a phone the app loses goal 3 in [ABOUT.md](ABOUT.md), explaining the theory along the way.
- Double-clicking the note ring toggles the lock. On iOS a double tap competes with Safari's double-tap zoom, so on touch the Relative/Parallel switch in the toolbar is the reliable way.

### Stage 1 steps

1. **Narrow-screen layout.** Add a breakpoint around 600px wide in `styles.css` that stacks the wheel, the chord panel and the chosen chord in one column. The wheel fills the width. The toolbar wraps: the readouts on one row, the Relative/Parallel switch full width, the Guide/About links and theme button compact. The chord table stays horizontally scrollable, with the mode name column sticky so you always know which row you're on. The guitar neck scales to the width. Tap targets are at least 44px.
2. **iPhone details.** Add `viewport-fit=cover` to the viewport meta and pad the page with `env(safe-area-inset-*)` so nothing sits under the notch or home bar. Put `touch-action: manipulation` on buttons so taps don't wait for a possible double tap. Make sure nothing relies on hover alone.
3. **Tap to explain.** Give touch screens a way to read the tooltips: for example, tapping an "info" button (or long-pressing a term) opens a small popover or bottom sheet with the same text from `tooltips.js`. Keep it in state and draw it in `render()`, like everything else. Keep the `title` attributes for desktop.
4. **Update GUIDE.md** with how things work on touch (tap to explain, using the toolbar switch for the lock).

### Testing without a Mac

- Layout: the device toolbar in Chrome or Firefox developer tools, at iPhone sizes.
- A real iPhone: `npm start` already listens on every network interface, so on the same Wi-Fi open `http://<your-linux-ip>:3000` in Safari. Live reload works there too.
- Errors: Safari's Web Inspector needs a Mac. Instead, have `server.js` inject a small on-page error overlay in development (it already injects the live-reload snippet), so JavaScript errors show up on the phone's screen. Nothing changes in the deployed app.
- Finally, check the live GitHub Pages site on the phone after pushing.

**Done when:** you can turn both rings, switch Relative/Parallel, pick a key signature, read the chord table, pick a chord, see it on the guitar and read every explanation, all on an iPhone in portrait.

## Stage 2: Installable web app (PWA)

**Goal:** Modescope opens from the home screen like an app, full screen, and works without a connection. Still free, still no Mac and no App Store.

### Stage 2 steps

1. **Web app manifest.** Add `public/manifest.webmanifest` with the name, `"display": "standalone"`, theme and background colors taken from the existing color tokens, and icons. Link it from `index.html`, along with a `theme-color` meta and the `apple-mobile-web-app-*` metas.
2. **Icons.** A 180 × 180 PNG `apple-touch-icon` (what iOS uses on the home screen), plus 192 and 512 PNGs for the manifest. A simple drawing of the wheel works well at small sizes.
3. **Service worker.** Add `public/sw.js`, which caches the app shell (`index.html`, `styles.css` and every file in `js/`) so the app works offline. To make sure each deploy replaces the old cache, `pages.yml` stamps the cache name with the commit SHA (a one-line `sed` before uploading), so there's still no build step locally. Don't register the service worker on `localhost`, so live reload keeps working during development.
4. **Install it.** In Safari: Share → Add to Home Screen.

### What a PWA doesn't get you

- No App Store listing, and no haptic feedback (the web can't vibrate on iOS).
- iOS may clear the storage of a home-screen app that hasn't been opened for a long time. The only thing stored is the theme choice, so this barely matters.

**Decision point:** for personal use, this may be all you need. Live with it for a while before moving on.

## Stage 3: Capacitor app, built on GitHub Actions

**Goal:** a real iOS app on your phone, installed through TestFlight, built and signed entirely by GitHub Actions. This is where the Apple Developer account ($99/year) comes in.

[Capacitor](https://capacitorjs.com/) wraps a web app in a native iOS shell: the app is a full-screen web view that loads files bundled inside it, plus a bridge to native features like haptics. Because Modescope has no build step, Capacitor can point straight at `public/` (`"webDir": "public"`), so the web code doesn't change and the same files keep deploying to GitHub Pages.

### Stage 3 steps

1. **Add Capacitor.** Install `@capacitor/core`, `@capacitor/cli` and `@capacitor/ios` and add `capacitor.config.json` (app name, bundle ID such as `io.github.<user>.modescope`, `webDir: "public"`). This adds dependencies, which the project otherwise avoids, so it's a deliberate exception for this stage.
2. **Create the Xcode project once, in CI.** `npx cap add ios` needs macOS, so run it in a manual (`workflow_dispatch`) job on a `macos-latest` runner, using Swift Package Manager, and commit the generated `ios/` folder. From then on, each build runs `npx cap sync ios` to copy the latest `public/` into it.
3. **Set up signing from a browser.** In the Apple Developer site and App Store Connect: register the bundle ID, create the app record, and create an **App Store Connect API key** (a `.p8` file). Store the key, its key ID, the issuer ID and your team ID as GitHub Actions secrets. With that key, [fastlane](https://fastlane.tools/) can create the distribution certificate and provisioning profile from CI (with `match` and a private repo for the certificates, or `cert` and `sigh`), so you never need Keychain Access or Xcode. If you'd rather make the certificate by hand, `openssl` on Linux can generate the signing request and turn the downloaded certificate into the `.p12` that CI needs.
4. **Build and upload workflow.** Add `.github/workflows/ios.yml`: on a version tag (or a manual run), on a macOS runner, run `npx cap sync ios`, build and sign the app, and upload it to **TestFlight** (`fastlane pilot`). Also boot the simulator, take a screenshot and attach it to the run as an artifact, as a quick visual check.
5. **Install on the phone.** Add yourself as an internal tester in App Store Connect and install the TestFlight app. Internal testers don't need Apple's beta review, and each new build shows up in TestFlight automatically.
6. **Native touches.** Small additions that make the app feel like more than a website, and make the rings feel physical: a light haptic tick each time a ring snaps (`@capacitor/haptics`), the status bar following the light/dark theme, and a splash screen. Check that Capacitor is present before calling them, so the web version is unaffected.

### Day-to-day work

Develop in the browser on Linux exactly as now. When you want a new build on the phone, push a tag; it reaches TestFlight in roughly 10 to 20 minutes. The repo is public, so GitHub's macOS runners are free; on a private repo, macOS minutes count ten times against the free allowance.

### The App Store

TestFlight is enough for personal use. A public App Store release is possible, but Apple's review guideline 4.2 (minimum functionality) can reject apps that are just a website in a wrapper; offline use and the native touches above help make the case.

## Stage 4: Native SwiftUI app (optional)

**Goal:** a native app written in Swift. Only worth it if the Capacitor app shows real limits: how dragging the rings feels, performance, home-screen widgets, an Apple Watch app, or playing chords with low-latency audio. It is a rewrite, and from then on there are two codebases to keep in step. The Capacitor app may well be good enough.

### Stage 4 steps

1. **Port the theory first.** `music.js`, `guitar.js`, `alternates.js` and `tooltips.js` have no DOM code, so they translate directly into a Swift package (say `ModescopeCore`). Swift runs on Linux, so this package can be written and tested (`swift test`) on Linux and in an Ubuntu CI job. No Mac is needed for this layer.
2. **Keep the two versions in agreement.** A Node script exports answers from the JavaScript modules as JSON: scale spellings, key signatures, `chordsOn` results and the guitar voicings for every root and chord type. The Swift tests check that they get the same answers, so the web and native apps can't quietly drift apart.
3. **Build the interface in SwiftUI:** the wheel drawn with `Canvas` or `Path`, turned with a `DragGesture` that snaps like `drag.js`; the chord table; the guitar neck. This part only compiles on macOS, so iterate through the macOS CI job (build, run UI tests in the simulator, attach screenshots to the run) and TestFlight. For the occasional hands-on session in Xcode, rent a cloud Mac by the hour (MacinCloud, AWS EC2 Mac and similar) rather than buying one.
4. **Keep the web version.** It stays the reference implementation and keeps deploying to GitHub Pages.

## Open decisions

- Where to stop: after stage 2, 3 or 4.
- Whether the repo stays public (free macOS build minutes, and the live site already makes the code public).
- The app's name and bundle ID, needed before stage 3.
- Whether to aim for the public App Store or keep it to TestFlight.
