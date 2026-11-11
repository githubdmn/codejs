# Contributing

This is a personal learning repo, but these conventions keep it consistent.

## Naming

- Files and directories: `kebab-case` (e.g. `binary-search.ts`)
- Classes: `PascalCase`
- Functions and variables: `camelCase`

## Structure

- One concept per directory in `dsa/` (e.g. `dsa/structures/queue/`) with `index.ts`, the implementation, its test, and a `README.md`.
- Dated experiments go in `experiments/YYYY-MM-topic/` with a short local README.
- Promote experiments to `examples/` or `src/` when they become useful; delete them otherwise.

## Workflow

- Run `npm run typecheck`, `npm test`, and `npm run lint` before committing.
- The pre-commit hook runs `lint-staged`, which formats staged files with Prettier.
