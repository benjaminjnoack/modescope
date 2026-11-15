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

**Status:** done. Phones get their own layout instead of the desktop one squeezed down, and touch screens get a way to read the explanations that tooltips give on desktop.

**Goal:** every feature is reachable and readable on an iPhone held upright, on the live site.

### What was done

- **A phone layout** (`styles.css`, below 600px wide, so any phone in portrait). The toolbar's readouts (tonic, mode, key signature) and the Relative/Parallel switch stay pinned at the top of the screen, while the title, the Guide/About links and the theme button scroll away above them. The panels stack in one column that scrolls: the wheel, the chord table, then the chosen chord and the guitar. For this the header in `index.html` is split into two groups (`.toolbar-brand` and `.toolbar-controls`); on desktop they still show as one row, as before.
- **Sized for fingers.** The key signatures are in two rows (7♭ to 0, then 1♯ to 7♯). On any touch screen, chord buttons, the switch and key signatures are at least 44px tall. The wheel's labels are a little bigger, since the wheel is drawn smaller.
- **Chord table.** It still scrolls sideways, and at every width the mode-name column stays in place, so you always know which row you're on.
- **An upright guitar neck.** In portrait, `fretboard.js` turns the neck a quarter turn into a chord chart: the nut at the top, low E on the left, string notes and O/X above the nut. It also uses shorter frets, so the neck is about 600px tall instead of three screens. `main.js` uses the same 600px query and redraws when the phone turns; in landscape the neck lies down again.
- **iPhone details.** `viewport-fit=cover`, with the page padded by `env(safe-area-inset-*)` to keep it clear of the Dynamic Island and the home bar. Buttons and links use `touch-action: manipulation`, so taps don't wait for a possible double tap. Nothing relies on hover.
- **Tap to explain** (`explain.js`). On a touch screen, tapping a term (a numeral, a readout, a mode name, a degree number, a guitar dot, an underlined word) shows its explanation in a panel at the bottom. Holding a button for half a second (a chord, a key signature, the switch, the voicing arrows) does the same without pressing it. The text is read from the `title` attributes already on the page, so the wording stays in `tooltips.js`, and the mouse still gets ordinary tooltips. The open explanation is kept in `state.js` and drawn by `render()`.
- **Toggling the lock.** A double tap isn't reliable on iOS, so on a phone the toolbar switch is how you lock the note ring. `GUIDE.md` says so, and has a new "On a phone" section.
- **An error box for testing.** `server.js` also injects a script that shows JavaScript errors in a red box at the top of the page; tap the box to dismiss it. Only the dev server adds it, so the deployed site doesn't have it.

### Checking in Firefox (responsive design mode)

1. Run `npm start` and open <http://localhost:3000> in Firefox.
2. Open responsive design mode with **Ctrl+Shift+M** (or Tools → Browser Tools → Responsive Design Mode).
3. Add an iPhone 17 if it isn't in the device list: open the device menu at the top, choose **Edit List…** → **Add Custom Device**, and enter 402 × 874, device pixel ratio 3, an iPhone Safari user agent, and **Touch Screen** checked. Then pick it from the menu.
4. Check portrait: the bar stays pinned while you scroll, the panels stack, the chord table scrolls sideways with the mode names fixed, and the neck stands upright. Use the rotate button in the toolbar to check landscape (874 wide), where the neck lies down and the layout goes back to the desktop one.
5. Turn on touch simulation (the hand icon) to try dragging the rings and tapping. Firefox's simulated touch isn't quite a real finger, so if tapping a term or holding a button doesn't open an explanation here, check on the phone before treating it as a bug.
6. Close responsive design mode and check the desktop layout still looks as it did.

### Checking on the iPhone

1. Put the phone and the Linux machine on the same Wi-Fi. Find the machine's address with `hostname -I` (the first address, e.g. `192.168.1.20`).
2. Run `npm start`. It listens on every network interface. If the phone can't connect, the firewall is probably blocking the port: `sudo ufw allow 3000/tcp`.
3. In Safari on the iPhone, open `http://<that address>:3000`. Safari says the page isn't secure because it's plain HTTP; that's fine for testing. Live reload works here too, so saving a file on Linux reloads the phone.
4. There's no Web Inspector without a Mac. Instead, JavaScript errors show in the red box at the top of the page.
5. Work through the list below in portrait, then turn the phone to check landscape (the neck lies down, and nothing sits under the Dynamic Island).
6. After pushing to `master`, do the same on the live site: <https://benjaminjnoack.github.io/modescope/>. (Safari may cache it; pull to reload.)

**Done when** all of these work on the iPhone in portrait:

- Drag both rings. Tap a note to select it, and tap a mode to turn it to the top.
- Switch between Relative and Parallel with the switch in the pinned bar.
- Pick a key signature. In Parallel, hold a grayed-out one and read why it's grayed out. (If Safari ignores touches on disabled buttons, change them to `aria-disabled` plus a check in the click handler.)
- Scroll the chord table sideways with the mode names staying put, and pick a chord.
- Read the chosen chord, step through its voicings with ‹ ›, and read the upright neck.
- Read explanations: tap a Roman numeral, a readout, a degree number and a guitar dot; hold a chord button and check that letting go doesn't also pick the chord; close the panel with ×.

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
