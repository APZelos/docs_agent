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
    "<TYPES>^@lib(/.*)$",
    "<TYPES>^[.]",
    "<TYPES>^@server(.*)$",
    "<TYPES>^src(/.*)$",
    "",
    "<BUILTIN_MODULES>",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@lib(/.*)$",
    "^@server(.*)$",
    "^src(/.*)$",
    "^[.]",
  ],
}

export default config
