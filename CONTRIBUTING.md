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

## Where things go

- `src/dsa/` — data structures & algorithms (with tests)
- `src/scripts/` — general-purpose CLI scripts
- `src/web/servers/` — HTTP/TCP servers (raw-node, express, fastify, hono)
- `src/web/apps/` — small web apps / UI experiments
- `src/db/` — database experiments (Postgres, SQLite, Mongo, Redis)
- `src/network/` — TCP/UDP/WebSocket/HTTP clients & servers
- `src/ts/` — TypeScript-only experiments (generics, decorators, types)
- `src/es6/` — modern JS feature demos
- `src/es5/` — legacy JS demos (var, prototypes, callbacks)
- `experiments/YYYY-MM-topic/` — dated, throwaway experiments
- `examples/` — polished, runnable examples
- `docs/` — notes, cheatsheets, learnings
- `playground/` — local scratch (git-ignored)
