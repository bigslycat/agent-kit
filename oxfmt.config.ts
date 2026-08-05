import { defineConfig } from 'oxfmt'

export default defineConfig({
  embeddedLanguageFormatting: 'auto',
  semi: false,
  singleQuote: true,
  sortImports: true,
  trailingComma: 'all',
  sortPackageJson: {
    sortScripts: true,
  },
  printWidth: 80,
  jsxSingleQuote: true,
  jsdoc: true,
  quoteProps: 'as-needed',

  overrides: [
    {
      files: ['*.js', '*.cjs', '*.mjs', '*.ts', '*.cts', '*.mts'],
      options: {
        printWidth: 100,
      },
    },
  ],
})
