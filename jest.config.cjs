module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/server/**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
