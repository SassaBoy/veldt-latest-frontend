module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // If you add other plugins (like 'module-resolver'), put them ABOVE reanimated
      'react-native-reanimated/plugin', 
    ],
  };
};