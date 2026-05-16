module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Required for reanimated 4.x worklet transforms (useAnimatedStyle, etc.)
    // Must be listed last in plugins array.
    plugins: ['react-native-reanimated/plugin'],
  };
};
