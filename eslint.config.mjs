import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import local from "./eslint-rules/index.mjs";

// `consistent-type-assertions: never` deja pasar `as const` por diseño.
// La regla del proyecto no admite ningún `as`, así que lo cerramos aparte.
const noAsConst = {
  selector: "TSAsExpression[typeAnnotation.typeName.name='const']",
  message:
    "Tampoco `as const`: declara el tipo literal completo (`const X: readonly [...] = [...]`) o usa `satisfies` (docs/code-rules.md).",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      local,
    },
    rules: {
      // Reglas del proyecto: docs/code-rules.md
      "max-lines-per-function": [
        "error",
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      // Nada de `as` en ningún sitio: el tipo se declara o se estrecha con un guard.
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "local/max-methods-per-class": ["error", { max: 10 }],
      "local/no-unknown-outside-narrowing": "error",
      "no-restricted-syntax": ["error", noAsConst],
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "class", format: ["PascalCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
          // Route Handlers de Next exportan GET, POST, etc.
          filter: {
            regex: "^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$",
            match: false,
          },
        },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      // Reglas de frontend: docs/frontend-rules.md
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: [], roles: [], allowExpressionValues: true },
      ],
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      // Un rol que ya tiene elemento nativo nunca se pone a mano.
      "no-restricted-syntax": [
        "error",
        noAsConst,
        {
          selector:
            "JSXAttribute[name.name='role'][value.value=/^(button|link|navigation|heading|list|listitem|main|banner|contentinfo|form|article|img|checkbox|radio|textbox|searchbox|combobox|table|row|cell|tab|menuitem)$/]",
          message:
            "Ese rol tiene un elemento HTML nativo. Usa <button>, <a>, <nav>, <h1>-<h6>, <ul>/<li>, <main>, <header>, <footer>, <form>, <article>, <img> o <input> en lugar de role sobre un div/span (docs/frontend-rules.md).",
        },
        {
          selector:
            "JSXAttribute[name.name='className'][value.value=/(^|\\s)(min|max)-\\[/]",
          message:
            "Breakpoint arbitrario en className. La escala es base (360px), md (768px) y lg (1024px); define el breakpoint en @theme si de verdad hace falta (docs/frontend-rules.md).",
        },
        {
          selector:
            "JSXAttribute[name.name='className'][value.value=/(^|\\s|:)w-\\[[1-9][0-9]{2,3}px\\]/]",
          message:
            "Ancho fijo en px: rompe el responsive a 360 px. Usa w-full con max-w-*, grid o flex (docs/frontend-rules.md).",
        },
      ],
    },
  },
  // Fronteras de docs/project.md §4. `app/` compone; nadie importa las tripas de una feature.
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/**"],
              message:
                "Importa la API pública de la feature (@/features/<nombre>). Dentro de una feature, usa rutas relativas (docs/project.md §4).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["features/**/*.ts", "features/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/**"],
              message:
                "Dentro de una feature usa rutas relativas para sus archivos internos; el alias solo sirve para su API pública (docs/project.md §4).",
            },
            {
              group: ["@/app", "@/app/**", "**/app/**"],
              message:
                "Una feature no importa de app/: la composición vive en app/ (docs/project.md §4).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["shared/**/*.ts", "shared/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/features",
                "@/features/**",
                "@/app",
                "@/app/**",
                "**/features/**",
                "**/app/**",
              ],
              message:
                "shared/ es la base: no puede depender de features/ ni de app/ (docs/project.md §4).",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Config del propio linter: no es código de la app.
    "eslint.config.mjs",
    "eslint-rules/**",
  ]),
]);

export default eslintConfig;
