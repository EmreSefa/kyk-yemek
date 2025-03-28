const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add svg as an asset type
config.resolver.assetExts.push("svg");

// Add support for importing SVG files as React components
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

// Make sure SVG is not in both assetExts and sourceExts
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
config.resolver.sourceExts.push("svg");

module.exports = config;
