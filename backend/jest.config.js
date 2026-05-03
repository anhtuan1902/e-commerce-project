module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__test__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/__test__/**',
    '!src/database/**',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
};
