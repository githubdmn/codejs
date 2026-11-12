---
name: TypeScript
description: TypeScript conventions for codejs (strict ESM, explicit types, naming, named exports, sibling Vitest tests in src/dsa) and the commands that actually verify changes
---

Follow `CONVENTIONS.md` at the repo root for layout, naming, and test rules. Where this skill is stricter on typing,
this skill wins.

## Typing

- Type everything explicitly: function parameters, return types, exported constants, class fields, and public method
  signatures.
- Never use `any`.
- Avoid `unknown`. Use it only when no precise type is possible, such as parsing untrusted input, and narrow it
  immediately.
- Prefer precise types: literal unions, generics, `readonly` arrays, and `satisfies` for checked object literals.
- When a type is shared or non-trivial, move it into a separate file, such as `types.ts` or `<name>.types.ts`, next to
  the code that uses it. Re-export it through the folder's `index.ts` if it's public.
- Use `import type` for type-only imports.
- Don't use `// @ts-ignore`. Use `// @ts-expect-error` with a comment only if unavoidable.

## Modules and style

- `.ts` by default. `.js` only in `src/es5/` and `src/es6/`.
- ESM only. No `require` or `module.exports` outside `src/es5/`.
- Keep the strict flags in `tsconfig.base.json` enabled. Don't re-declare compiler options.
- Named exports only, `const` by default, kebab-case filenames.
- Every file under `src/dsa/` needs a sibling `*.test.ts`.

## Verify

- `npx vitest run <path>` for focused tests, or `npm test` for all.
- `npx tsc -p src/tsconfig.json --noEmit`. Expect only the `node:sqlite` errors in `src/db/sqlite/`.
- Don't use `npm run typecheck` (checks nothing) or `npm run lint` (broken under ESLint 8).
