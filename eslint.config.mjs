import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next already registers the jsx-a11y plugin; only the
    // strict rule set is layered on top.
    files: ['**/*.{ts,tsx}'],
    rules: {
      ...jsxA11y.flatConfigs.strict.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description', 'ts-ignore': true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { ignoreRestSiblings: true, argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/link',
              message: 'Use Link from @/i18n/navigation on public pages.',
            },
          ],
          patterns: [
            {
              group: ['@sanity/*', 'groq-js', '**/lib/content/sanity/*'],
              message:
                'Components never talk to Sanity; go through @/lib/content.',
            },
          ],
        },
      ],
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['src/lib/content/**', 'scripts/**', 'tests/support/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['src/app/admin/**', 'src/components/admin/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@sanity/*', 'groq-js', '**/lib/content/sanity/*'],
              message: 'The admin goes through @/lib/content too.',
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
]);
