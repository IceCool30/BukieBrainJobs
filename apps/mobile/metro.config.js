const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const PINNED = new Set(['react', 'react-dom']);
const anchor = path.join(__dirname, 'package.json');

// Exclude test files and test suites from Metro bundling
config.resolver.blockList = [
  /.*\.test\.[jt]sx?$/,
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : (config.resolver.blockList ? [config.resolver.blockList] : [])),
];

// The web app pulls React 19 into the workspace; resolving these from here keeps every package on the app's single React 18 copy.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'vitest' || moduleName.startsWith('@vitest/')) {
    return { type: 'empty' };
  }
  const origin = PINNED.has(moduleName.split('/')[0]) ? anchor : context.originModulePath;
  return context.resolveRequest({ ...context, originModulePath: origin }, moduleName, platform);
};

module.exports = config;
