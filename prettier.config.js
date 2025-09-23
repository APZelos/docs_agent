/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  bracketSameLine: false,
  bracketSpacing: false,
  semi: false,
  tabWidth: 2,
  printWidth: 100,
  experimentalTernaries: true,
  importOrder: [
    "<TYPES>",
    "<TYPES>^[.]",
    "",
    "<BUILTIN_MODULES>",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@server(.*)$",
    "^src(/.*)$",
    "^[.]",
  ],
}

export default config
