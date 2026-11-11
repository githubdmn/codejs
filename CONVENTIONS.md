# codejs — Conventions for aider

You are helping build a personal learning/experimentation repository.
Follow these rules for **every** file you create or edit.

## Language & runtime

- **TypeScript is the default.** Create `.ts` files unless told otherwise.
- `.js` files are ONLY allowed inside `src/es5/` and `src/es6/`, where the
	point is to demonstrate a specific JS language version.
- Node 20+, **ESM only**. Every `package.json` must have `"type": "module"`.
- No CommonJS (`require`, `module.exports`) outside `src/es5/`.

## TypeScript config

- Extend `tsconfig.base.json`; do not re-declare compiler options inline.
- Strict mode is on. Do not weaken it (`strict`, `noUncheckedIndexedAccess`,
	`exactOptionalPropertyTypes`, `verbatimModuleSyntax` all stay true).
- Prefer `import type` for type-only imports.

## Code style

- Files/dirs: `kebab-case`. Classes: `PascalCase`. Functions/vars: `camelCase`.
- Prefer `const`. No `var` outside `src/es5/`.
- Prefer named exports over default exports.
- No `any` — use `unknown` and narrow.
- No `// @ts-ignore` — use `// @ts-expect-error` with a comment if unavoidable.

## Tests

- Every file in `src/dsa/` gets a sibling `*.test.ts` (Vitest).
- Test names: `describe('<Subject>')` / `it('<behavior>')`.
- Do not add tests for demo-only files in `src/es6/`, `src/es5/`,
	`src/network/`, or `examples/` unless explicitly asked.

## File layout

- `src/<topic>/<item>/index.ts` — public entrypoint (re-exports).
- Each `src/<topic>/<item>/` may contain a short `README.md`.
- New one-off experiments go in `experiments/YYYY-MM-topic/`.
- Do NOT touch `playground/` — it is git-ignored and user-owned.

## Do-not-touch list

- `playground/**`
- `docs/**` (user writes these)
- `.aider.conf.yml`
- Any file with a `// aider:lock` comment at the top.

## Change discipline

- One logical change per aider command.
- Do not reformat unrelated files.
- Do not delete files unless explicitly instructed.
- If a command is ambiguous, ask before creating many files.
