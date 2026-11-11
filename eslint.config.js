import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', 'node_modules/**', 'coverage/**', 'playground/**'] },
  ...tseslint.configs.recommended,
);
