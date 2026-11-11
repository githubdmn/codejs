# Structuring a Multi-Purpose JavaScript/TypeScript Repository

Great idea! A "monorepo playground" is a common and useful pattern. Here's how I'd structure and document it, plus things you likely missed.

---

## 1. Recommended Directory Layout

```
codejs/
├── README.md
├── package.json                 # root (workspaces, scripts)
├── tsconfig.base.json           # shared TS config
├── .editorconfig
├── .gitignore
├── .nvmrc
├── .prettierrc
├── eslint.config.js             # flat config (ESLint 9+)
├── vitest.config.ts             # or jest
│
├── src/                         # main source tree
│   ├── dsa/                     # data structures & algorithms
│   │   ├── structures/
│   │   ├── algorithms/
│   │   └── README.md
│   ├── scripts/                 # general-purpose CLI scripts
│   ├── web/
│   │   ├── servers/             # raw http, express, fastify...
│   │   └── apps/                # small web apps, ui experiments
│   ├── db/                      # postgres, sqlite, mongo, redis...
│   ├── network/                 # tcp, udp, websockets, http clients
│   ├── ts/                      # typescript-specific experiments
│   ├── es6/                     # modern JS features
│   └── es5/                     # legacy JS (var, prototypes, callbacks)
│
├── experiments/                 # throwaway / dated experiments
│   └── 2025-01-foo/
│
├── playground/                  # scratchpad (git-ignored or per-branch)
│
├── examples/                    # runnable, documented examples
│
├── docs/                        # notes, cheatsheets, learnings
│
└── tests/                       # (or co-locate *.test.ts next to source)
```

**Key principle:** everything is TypeScript by default. `.js` files only appear in `es5/` and `es6/` when the *point* is to demonstrate the language version.

---

## 2. Root `package.json` (workspaces sketch)

```json
{
  "name": "codejs",
  "private": true,
  "type": "module",
  "workspaces": ["src/*", "examples/*", "experiments/*"],
  "scripts": {
    "build": "tsc -b",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "clean": "rm -rf node_modules **/dist"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "tsx": "^4.16.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0"
  }
}
```

Use **`tsx`** (or `ts-node` / Node's native `--experimental-strip-types`) to *run* TS files directly without a build step — huge quality-of-life win for a playground.

---

## 3. `README.md` Template

```markdown
# codejs

A personal workspace for learning, experimenting, and building with
JavaScript & TypeScript. Everything is TypeScript by default.

## Quick start

```bash
nvm use            # respects .nvmrc
npm install
npm run typecheck
npm test
npm run dev -- src/web/apps/hello   # example
```

## Layout

| Path              | Purpose                                                      |
|-------------------|--------------------------------------------------------------|
| `src/dsa/`        | Data structures & algorithms with tests                     |
| `src/scripts/`    | General-purpose CLI scripts                                 |
| `src/web/`        | Web servers & small web apps                                |
| `src/db/`         | Database experiments (Postgres, SQLite, Mongo, Redis)       |
| `src/network/`    | TCP/UDP/WebSocket/HTTP clients & servers                    |
| `src/ts/`         | TypeScript-only experiments (generics, decorators, types)   |
| `src/es6/`        | Modern JS feature demos                                     |
| `src/es5/`        | Legacy JS demos (var, prototypes, callbacks)                |
| `experiments/`    | Dated, throwaway experiments                                |
| `examples/`       | Polished, runnable examples                                 |
| `docs/`           | Notes, cheatsheets, learnings                               |
| `playground/`     | Local scratch (git-ignored)                                 |

## Conventions

- **TypeScript is the default.** `.js` files only exist in `es5/` / `es6/`
  where the language version *is* the topic.
- Every example is runnable: `npm run dev -- <path>`.
- Algorithms and data structures ship with a `*.test.ts` next to the source.
- New experiments go in `experiments/YYYY-MM-topic/` with a local README.
- `playground/` is for throwaway code and is `.gitignore`d.

## Tooling

- Node 20+, ESM only, `"type": "module"`
- TypeScript strict mode (`tsconfig.base.json`)
- Vitest for tests, ESLint (flat) + Prettier for style
- `tsx` to run `.ts` directly

## Related

- [docs/cheatsheets.md](docs/cheatsheets.md)
```

---

## 4. `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

---

## 5. Things You Might Have Missed

### Repo & workflow hygiene
- **`.nvmrc`** – pin Node version so examples stay reproducible.
- **`"engines": { "node": ">=20" }`** in `package.json`.
- **`.editorconfig` + Prettier** – since it's a learning repo, consistency saves you mental overhead.
- **`.gitattributes`** – line endings, binary paths (e.g. `.db`, `.sqlite` files).
- **`.gitignore`** – `node_modules`, `dist`, `*.sqlite`, `.env*`, `playground/`, coverage.
- **LICENSE** (MIT is fine) – even for personal repos, it makes forks/borrows unambiguous.
- **`.env.example`** – for DB/network experiments you'll eventually need secrets.

### Tooling choices
- **ESM from day one** (`"type": "module"`, `NodeNext`) — the ecosystem is heading there; switching later is painful.
- **Runners**: `tsx` for files, `node --watch` for servers, `vitest` for tests. Pick one and stick to it.
- **Linter**: ESLint v9 flat config (`eslint.config.js`) — the old `.eslintrc` is deprecated.
- **Pre-commit hook** via `husky` + `lint-staged` — small cost, keeps the repo clean.
- **`tsc -b` + project references** if you use workspaces; makes `build`/`typecheck` fast.
- **`c8` or Vitest's built-in coverage** — useful for DSA study.

### Repo-specific conventions
- **Naming**: `kebab-case` for files/dirs, `PascalCase` for classes, `camelCase` for functions. Write it down in the README or `CONTRIBUTING.md`.
- **One concept per directory** in `dsa/` (e.g. `dsa/structures/queue/`) with `index.ts`, `queue.ts`, `queue.test.ts`, `README.md`.
- **Dated experiments**: `experiments/2025-01-09-websocket-chat/` — prevents `experiments/` from becoming a graveyard of `test2.ts`.
- **Archival rule**: promote experiments to `examples/` or `src/` when they become useful; delete otherwise. Say so explicitly in the README.
- **`docs/` for write-ups** — a `learnings.md` per topic; this is where the *learning* actually sticks.

### Things for specific domains
- **`src/db/`**: prefer Docker Compose (`db/compose.yaml`) over local installs; keep `init.sql` / migrations per subproject.
- **`src/web/`**: one folder per stack (`express/`, `fastify/`, `hono/`, `raw-node/`) so comparisons are easy.
- **`src/network/`**: note whether examples bind to `localhost` only; add a `README` with required ports.
- **`src/es5/` and `src/es6/`**: exclude from typechecking if the point is syntax (`// @ts-nocheck` at the top, or a separate `tsconfig` that skips them).
- **`src/ts/`**: keep examples *compile-only* where useful (`tsc --noEmit` showcases) alongside runtime ones.

### Risk/reality checks
- Don't add **workspaces** until you actually have package-per-directory needs — plain folders + root `tsconfig` is simpler.
- Skip a **build step** for the whole repo; use `tsx`/`--watch`. Only `src/scripts` that you actually ship need `tsc -b`.
- Avoid mixing **CJS and ESM** unless the point is to demo it — put such demos in `es5/` or `experiments/`.
- A `playground/` directory that's git-ignored is a great pressure valve; without it, `experiments/` gets polluted.

---

## 6. Minimal Next Steps

1. `npm init -y`, set `"type": "module"`, add the scripts above.
2. Create `tsconfig.base.json` + root `tsconfig.json` (`{ "extends": "./tsconfig.base.json", "files": [] }` with `references` as you grow).
3. Add `.nvmrc`, `.editorconfig`, `.gitignore`, `LICENSE`, `eslint.config.js`, `.prettierrc`, `vitest.config.ts`.
4. Drop the README template in and adjust the table.
5. Write one real example per top-level folder so the layout is self-documenting:
    - `dsa/structures/stack/`
    - `scripts/hello.ts`
    - `web/servers/raw-node/`
    - `db/sqlite/`
    - `network/udp-echo/`
    - `es6/iterators/`
    - `es5/callbacks/`
6. Add a pre-commit hook.
7. Start using `experiments/YYYY-MM-topic/` for anything new and prune quarterly.

That's a repo that's pleasant to learn in, easy to grow, and won't fight you when you add the 20th experiment.
