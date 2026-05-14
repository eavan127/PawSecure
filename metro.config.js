// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'tflite' to assetExts so Metro bundles it as a raw asset
config.resolver.assetExts.push('tflite');
config.resolver.assetExts.push('bin'); // sometimes model weights
config.resolver.assetExts.push('txt'); // for labels.txt

module.exports = config;
