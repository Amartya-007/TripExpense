const fs = require('node:fs');
const path = require('node:path');
const { withDangerousMod, withAppBuildGradle } = require('@expo/config-plugins');

function withAndroidLocalProperties(config) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const androidDirectory = path.join(modConfig.modRequest.platformProjectRoot);
      const sdkDirectory =
        process.env.ANDROID_HOME ||
        process.env.ANDROID_SDK_ROOT ||
        (process.platform === 'win32'
          ? path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk')
          : path.join(process.env.HOME || '', 'Library', 'Android', 'sdk'));

      if (!sdkDirectory || !fs.existsSync(sdkDirectory)) {
        throw new Error(
          'ANDROID_HOME or ANDROID_SDK_ROOT must point to the Android SDK before running Expo prebuild.',
        );
      }

      const localProperties = `sdk.dir=${sdkDirectory.replace(/\\/g, '/')}\n`;
      fs.writeFileSync(path.join(androidDirectory, 'local.properties'), localProperties);
      return modConfig;
    },
  ]);
}

function withStableDebugKeystore(config) {
  const isLocalDevelopment = (process.env.EXPO_PUBLIC_APP_ENV || 'development') === 'development';
  if (process.env.EXPO_STABLE_DEBUG_KEYSTORE !== '1' || process.env.CI || !isLocalDevelopment) {
    return config;
  }

  const stableKeystore = path.join(
    process.env.USERPROFILE || process.env.HOME || '',
    '.android',
    'tripexpense-debug.keystore',
  );
  if (!fs.existsSync(stableKeystore)) {
    throw new Error(
      `EXPO_STABLE_DEBUG_KEYSTORE=1 requires ${stableKeystore} to exist.`,
    );
  }

  return withAppBuildGradle(config, (modConfig) => {
    const stableStoreFile = "file(new File(System.getProperty('user.home'), '.android/tripexpense-debug.keystore'))";
    const contents = modConfig.modResults.contents.replace(
      /storeFile file\('debug\.keystore'\)/,
      `storeFile ${stableStoreFile}`,
    );

    if (contents === modConfig.modResults.contents) {
      throw new Error('Could not find the generated Android debug signing configuration.');
    }

    modConfig.modResults.contents = contents;
    return modConfig;
  });
}

module.exports = function withAndroidLocalConfig(config) {
  return withStableDebugKeystore(withAndroidLocalProperties(config));
};
