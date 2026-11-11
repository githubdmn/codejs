# Project Learning Rules (for this book)

## Language & Tools
- Default to TypeScript for all implementations.
- Use `nvm use` and Node 20.
- Run `npm run typecheck` and `npm test` after each implementation.

## Learning Mode
- When I ask for help with an exercise, **do not give me the full answer immediately**.
- First, provide a skeleton or pseudocode, and let me fill in the logic.
- If I'm stuck for more than 2 rounds of dialogue, then provide the complete reference implementation.

## File Naming
- Chapter implementations go under `src/chapter-XX/`.
- Each data structure/algorithm gets its own file (e.g., `Stack.ts`, `Queue.ts`).
- Corresponding tests go under `tests/chapter-XX/`.

## Code Style
- Use `class` for data structures.
- Avoid `any`; use generics where appropriate.
- Include JSDoc comments explaining time/space complexity.
