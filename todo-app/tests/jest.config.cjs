module.exports = {
  rootDir: '..',
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/todo.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.js'],
  testTimeout: 15000,
};
