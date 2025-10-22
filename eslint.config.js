import js from "@eslint/js"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import {defineConfig} from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig(
  {ignores: ["dist", "src/test/convex/_generated"]},
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },

    files: ["**/*.{ts,tsx}"],
    rules: {
      "require-yield": "off",
      "max-len": [
        "error",
        {
          code: 120,
          ignoreComments: true,
          ignoreTrailingComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": ["error", {prefer: "type-imports"}],
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: false,
        },
      ],
      /* Allow void for async functions */
      "no-void": ["error", {allowAsStatement: true}],
      "object-shorthand": "error",
      "prefer-const": "error",
    },
  },
  eslintPluginPrettierRecommended,
)
