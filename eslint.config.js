// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  // 1. Pass and spread all TypeScript recommended configs directly as flat arguments
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  // @ts-ignore: angular-eslint v18 types clash with typescript-eslint v8 types
  ...angular.configs.tsRecommended,

  // 2. Apply your custom TypeScript rules and the Angular processor
  {
    files: ["**/*.ts"],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },

  // 3. Spread all HTML recommended configs directly as flat arguments
  // @ts-ignore
  ...angular.configs.templateRecommended,
  // @ts-ignore
  ...angular.configs.templateAccessibility,

  // 4. Apply your custom HTML rules
  {
    files: ["**/*.html"],
    rules: {},
  }
);