const files = {
  tests: [
    '**/spec.*',
    'tests/**',
  ],
  docs: [
    'docs/**',
    '**/*.stories.*',
    '**/docs.*.*',
  ],
};

module.exports = {
  extends: "@vizworx/eslint-config-react",
  overrides: [
    {
      files: ['.storybook/**'].concat(files.tests, files.docs),
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      },
    },
    {
      files: files.docs,
      rules: { 'no-alert': 0 },
    },
    {
      files: files.tests,
      env: { jest: true, },
    },
    {
      files: [].concat(files.tests, files.docs),
      rules: {
        'max-classes-per-file': 'off',
        'class-methods-use-this': 'off',
        'react/prop-types': 'off',
      },
    },
  ],
};
