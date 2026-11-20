# How to use Modescope

Modescope is a wheel for exploring the seven modes (Ionian through Locrian) and the chords in them. Spin it to change the key or mode, pick a note to see which chords on it belong to which mode, and see how to spell and play each one.

**Open it:** <https://benjaminjnoack.github.io/modescope/>

## The toolbar

The bar at the top shows the current tonic, mode and key signature. It also has:

- **Relative · keep notes / Parallel · keep tonic:** what turning the inner ring does (see below).
- **Guide** and **About** links, and a button that switches between the light and dark themes. The page starts in the theme your device uses and remembers your choice.

## The wheel

- **Outer ring (notes):** drag to change the key. The tonic sits under the **I** at the top and is gold. The other notes of the mode are pale gold, and the notes outside it are gray. The legend under the wheel shows what each color means.
- **Inner ring (modes):** drag to change the mode, or click a mode to turn it to the top. Each mode has its own color, which it keeps in the chord table. The current mode's color is stronger.
  - **Relative · keep notes (default):** the notes stay the same and the tonic moves. C Ionian becomes D Dorian, then E Phrygian, and so on.
  - **Parallel · keep tonic:** the tonic stays the same and the notes change. C Ionian becomes C Dorian, then C Phrygian, and so on. The outer ring is locked: it has a thick gray outline and can't be dragged.
- **Switch between them** with the switch in the toolbar, or by double-clicking the outer ring. On a phone, use the switch: a double tap isn't reliable there.
- **Roman numerals** around the outside show the chord built on each degree of the mode. Uppercase numerals are major chords, lowercase are minor, and ° marks diminished.

## Key signature

The center of the wheel shows the key signature of the current scale, as the number of sharps or flats a staff would show (for example 4♭ for F Aeolian). A key signature only says which notes are used, so every mode with the same notes shares it: four flats is A♭ Ionian, B♭ Dorian, C Phrygian, F Aeolian and so on. Turning the inner ring while it's unlocked keeps the key signature and moves the tonic.

Under the wheel is a row of key signatures from 7♭ to 7♯; the current one is raised. Use it to find a song from a songbook: pick the signature on its staff, then turn the inner ring until the tonic is the note that sounds like home.

- **Relative:** the outer ring turns to the signature's notes and the mode stays the same. From Aeolian, 4♭ goes to F Aeolian and 2♯ to B Aeolian.
- **Parallel:** the tonic stays and the mode changes to the one with that signature. With C as the tonic, 4♭ goes to C Phrygian. Signatures that no mode on the tonic has are grayed out.
- 7♯ and 5♭ are the same notes, spelled differently (C♯ vs D♭ major), as are 6♯/6♭ and 5♯/7♭. The button you pick sets the spelling.

## Selecting a note

- **Click a note** on the outer ring to select it. It gets a blue outline. A note is always selected, and the page starts with the top note.
- **Note names follow the scale.** The notes of the mode use each letter A–G exactly once, so F Ionian shows B♭ (not A♯/B♭) and F♯ Ionian shows E♯ (not F). A black-key tonic gets the spelling with fewer accidentals, so D♭ Ionian rather than C♯ Ionian. Notes outside the mode show both names (C♯/D♭) and use the first one when selected.
- **Click a selected note again** to switch its spelling: a note outside the mode toggles C♯ ↔ D♭, and the tonic respells the whole scale (D♭ Ionian ↔ C♯ Ionian). The chosen spelling is used everywhere that note is named.

## Chord table

For the selected note, the table lists the chords on it in each parallel mode of the current tonic. There's a row for each mode: the current mode is at the top (highlighted), and the rest follow in order (Ionian → Dorian → …). Each row starts with the mode's color, its name and the Roman numeral of the note in that mode. The columns group the chords by kind: triads, power chords, sus chords, 6ths, 7ths, 9ths, and 11ths and 13ths. A chord is listed in a mode only when every one of its notes is in that mode, and a mode that doesn't contain the note says so.

Every chord is outlined in its mode's color, the same color as on the inner ring. So when you use a chord that isn't in the current mode (a borrowed chord), its color shows which mode it comes from. Each mode spells the note with its own letters, so with G♯ as the tonic, C is listed as B♯m in G♯ Ionian. For example, with C as the tonic, D is listed in C Ionian (Dm) and in C Lydian (D).

These chord types are included:

| Group | Chords |
|---|---|
| Triads | major, m, ° |
| Power chord | 5 |
| Suspended | sus2, sus4 |
| 6ths | 6, m6 |
| 7ths | 7, maj7, m7, m7♭5 |
| 9ths | add9, madd9, add9♯4, 9, maj9, m9 |
| 11ths | m11 |
| 13ths | 13, maj13 (without the 11th) |

## The chosen chord

Below the wheel and the table, the chosen chord is spelled out note by note, next to the guitar. It starts as the first chord in the table; clicking a chord in the table chooses that one instead. The chord you chose is filled in, and the same chord in other modes is tinted with their colors. Above its name is the mode it was chosen from and its Roman numeral there, and below the name the kind of chord (minor triad, dominant 7th, …).

- **Letters:** each chord tone gets its own letter, so D♭m is D♭ F♭ A♭, not D♭ E A♭.
- **Degree numbers:** the numbers under each note are scale degrees counted from the tonic of the mode the chord was chosen from, not from the chord's root. D in C Lydian reads 2 ♯4 6 rather than 1 3 5.

## Guitar

Beside the chosen chord's notes, it's shown on a guitar neck in standard tuning (E A D G B E), lying on its side: the nut is on the left, the high e string is on top (as in guitar tab), and frets 1–12 run to the right. The neck is maple in the light theme and ebony in the dark one.

- **Dots** are fingers. A **bar** is one finger lying flat across several strings at one fret (a barre chord). They don't say which finger to use; that's up to you.
- Left of the nut, **O** marks a string played open and **X** a string you don't play.
- Next to them is the **note each string sounds**, spelled as in the chord (D♭m shows F♭, not E).

When a chord has no hand-picked voicing, the fingering is worked out by the app: it's the easiest one it finds with the chord's root as the lowest note, no more than four fingers and a reach of four frets. Like most guitarists, it may leave out the 5th of a chord with four or more notes, and the 9th of an 11th or 13th chord (so a 13th chord can be just 1 3 ♭7 13).

Many chords also have hand-picked voicings, such as barre chords further up the neck. "On guitar" above the neck shows how many voicings there are ("1 of 3", or "1 of 1" when there is only one), and the ‹ › arrows on either side step through them, in this order: voicings chosen for this site (like Gm as a barre at the 3rd fret), then other common shapes, with the familiar open chord first where there is one, then the one the app works out. Picking another chord starts again from the first.

## Tooltips

Hover over the toolbar, the Roman numerals, the mode names and numerals in the chord table, the chord buttons, the chosen chord's name and degree numbers, or the guitar's strings, dots and "On guitar" for an explanation of each term.

On a phone or tablet, which can't hover:

- **Tap a term** (a Roman numeral, a readout in the toolbar, a mode name, a degree number, a dot on the guitar, any underlined word) to read its explanation in a panel at the bottom of the screen.
- **Touch and hold a button** (a chord, a key signature, the Relative/Parallel switch, the voicing arrows) for half a second to read its explanation without pressing it.
- Close the panel with its × button, or tap somewhere without an explanation. Tapping another term replaces it.

## On a phone

Held upright, the page is one column that you scroll: the wheel, then the chord table, then the chosen chord and the guitar. The tonic, mode, key signature and the Relative/Parallel switch stay pinned at the top of the screen while you scroll, so you can always see where you are and switch modes.

- The key signatures are in two rows: 7♭ to 0, then 1♯ to 7♯.
- The chord table scrolls sideways. The mode names stay in place so you know which row you're on.
- The guitar neck stands upright like a chord chart: the nut is at the top, the low E string on the left and the high e on the right, with each string's note and O or X above the nut. Turn the phone sideways to see it lying down.

To use it like an app, open the site in Safari and choose Share → Add to Home Screen. It then opens full screen from its own icon and works without a connection. It updates itself the next time it's opened online.
