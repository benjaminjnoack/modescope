// Light and dark themes. The page follows the system setting until the
// theme button is pressed; the choice is then remembered in this browser.
// styles.css does the rest from the `data-theme` attribute on <html>.

const STORAGE_KEY = "modescope-theme";
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

// "light", "dark", or null to follow the system.
let chosen = load();

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null; // Storage can be blocked, e.g. in a private window.
  }
}

function save(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Not remembered, but the theme still changes for this visit.
  }
}

function current() {
  return chosen ?? (systemDark.matches ? "dark" : "light");
}

function apply(button) {
  const theme = current();
  document.documentElement.dataset.theme = theme;
  const label = theme === "dark" ? "Switch to the light theme" : "Switch to the dark theme";
  button.setAttribute("aria-label", label);
  button.title = label;
}

// Wire up the theme button and apply the theme.
export function initTheme(button) {
  apply(button);
  button.addEventListener("click", () => {
    chosen = current() === "dark" ? "light" : "dark";
    save(chosen);
    apply(button);
  });
  systemDark.addEventListener("change", () => apply(button));
}
