import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // This app fetches data on mount via `useEffect(() => { load() }, [])`
      // throughout — admin CRUD pages, auth/session reads, etc. That pattern
      // trips react-hooks/set-state-in-effect (a rule aimed at React
      // Compiler-era code) on essentially every page. We don't use the
      // Compiler here, and the pattern itself is correct, so downgrade this
      // one rule to a warning instead of chasing false positives file by file.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
