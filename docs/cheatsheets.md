# Cheatsheets

## git

- `git status` – show working tree state
- `git switch -c <branch>` – create and switch to a branch
- `git stash push -m "msg"` – stash changes with a message

## npm

- `npm install` – install dependencies from `package.json`
- `npm run <script>` – run a script defined in `package.json`
- `npm run dev -- <file>` – run a TypeScript file with `tsx`

## tsconfig

- `strict` – enables the full set of strict type-checking options
- `noUncheckedIndexedAccess` – array index access returns `T | undefined`
- `verbatimModuleSyntax` – requires `import type` for type-only imports
