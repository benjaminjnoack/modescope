// ESLint flat config. scripts/lint.js passes the files, so gitignored ones
// never reach it.
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    // The app: native ES modules in the browser.
    files: ["public/js/**/*.js"],
    languageOptions: { sourceType: "module", globals: globals.browser },
  },
  {
    // Dev-only Node scripts, written as CommonJS.
    files: ["server.js", "scripts/**/*.js"],
    languageOptions: { sourceType: "commonjs", globals: globals.node },
  },
];
