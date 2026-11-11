# SQLite example

Uses Node's built-in `node:sqlite` module (no extra dependency). On Node 20/21
it is experimental and requires `--experimental-sqlite`; on Node 22+ it is stable.

Run it: `node --experimental-sqlite --import tsx src/db/sqlite/demo.ts`

The generated `demo.sqlite` file is git-ignored.
