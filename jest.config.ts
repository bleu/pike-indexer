import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '\\.spec\\.ts$'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testTimeout: 300000,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  injectGlobals: true,
  // Run tests sequentially
  maxWorkers: 1,
};

export default config;
