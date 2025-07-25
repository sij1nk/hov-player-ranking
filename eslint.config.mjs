// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/src/generated/**", "eslint.config.mjs"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended
);
