const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);
console.log('Default watchFolders:', JSON.stringify(config.watchFolders, null, 2));
