export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.js'],
  testMatch: ['<rootDir>/src/test/**/*.test.{js,jsx}'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest']
  },
  moduleFileExtensions: ['js', 'jsx']
};
