const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Excludes native build intermediate folders (android/app/.cxx,
 * android/build, android/.gradle, ios build output) from Metro's file
 * watcher. Gradle's CMake step creates/deletes files inside .cxx very
 * fast, which crashes Metro's watcher on Windows with ENOENT — these
 * folders have no JS in them anyway, so Metro never needed to watch them.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: [
      /android\/app\/\.cxx\/.*/,
      /android\/app\/build\/.*/,
      /android\/build\/.*/,
      /android\/\.gradle\/.*/,
      /ios\/build\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
