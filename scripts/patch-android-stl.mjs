import fs from 'node:fs';
import path from 'node:path';

const replacements = [
  {
    file: path.join('node_modules', 'react-native-screens', 'android', 'CMakeLists.txt'),
    find: `target_link_libraries(rnscreens
    ReactAndroid::reactnative`,
    replace: `target_link_libraries(rnscreens
    c++_shared
    log
    ReactAndroid::reactnative`,
  },
  {
    file: path.join('node_modules', 'react-native-reanimated', 'android', 'CMakeLists.txt'),
    find: `target_link_libraries(
  reanimated
  log`,
    replace: `target_link_libraries(
  reanimated
  c++_shared
  log`,
  },
  {
    file: path.join('node_modules', 'react-native-worklets', 'android', 'CMakeLists.txt'),
    find: 'target_link_libraries(worklets android log ReactAndroid::reactnative',
    replace: 'target_link_libraries(worklets c++_shared android log ReactAndroid::reactnative',
  },
  {
    file: path.join('node_modules', 'react-native-nitro-modules', 'android', 'build.gradle'),
    find: `  sourceSets {
    main {
      if (isNewArchitectureEnabled()) {`,
    replace: `  sourceSets {
    main {
      kotlin.srcDirs += ["src/main/java", "src/main/kotlin"]
      if (isNewArchitectureEnabled()) {`,
  },
  {
    file: path.join('node_modules', 'react-native-nitro-modules', 'android', 'CMakeLists.txt'),
    find: `        NitroModules
        \${LOG_LIB}`,
    replace: `        NitroModules
        c++_shared
        \${LOG_LIB}`,
  },
  {
    file: path.join('node_modules', 'expo-modules-core', 'android', 'cmake', 'main.cmake'),
    find: `  expo-modules-core
  PRIVATE
  \${LOG_LIB}`,
    replace: `  expo-modules-core
  PRIVATE
  c++_shared
  \${LOG_LIB}`,
  },
  {
    file: path.join('node_modules', 'react-native-nitro-google-signin', 'android', 'CMakeLists.txt'),
    find: `        \${PACKAGE_NAME}
        \${LOG_LIB}`,
    replace: `        \${PACKAGE_NAME}
        c++_shared
        \${LOG_LIB}`,
  },
  {
    file: path.join('node_modules', 'react-native-gesture-handler', 'android', 'src', 'main', 'jni', 'CMakeLists.txt'),
    find: `  \${PACKAGE_NAME}
  ReactAndroid::reactnative`,
    replace: `  \${PACKAGE_NAME}
  c++_shared
  ReactAndroid::reactnative`,
  },
  {
    file: path.join('node_modules', 'react-native-safe-area-context', 'android', 'src', 'main', 'jni', 'CMakeLists.txt'),
    find: '          ${LIB_TARGET_NAME}\n          fbjni',
    replace: '          ${LIB_TARGET_NAME}\n          c++_shared\n          fbjni',
  },
  {
    file: path.join('node_modules', 'react-native-svg', 'android', 'src', 'main', 'jni', 'CMakeLists.txt'),
    find: '    react_codegen_rnsvg\n    ReactAndroid::reactnative',
    replace: '    react_codegen_rnsvg\n    c++_shared\n    ReactAndroid::reactnative',
  },
  {
    file: path.join('node_modules', 'react-native-screens', 'android', 'src', 'main', 'jni', 'CMakeLists.txt'),
    find: '  ${LIB_TARGET_NAME}\n  ReactAndroid::reactnative',
    replace: '  ${LIB_TARGET_NAME}\n  c++_shared\n  ReactAndroid::reactnative',
  },
];

let changed = 0;

for (const { file, find, replace } of replacements) {
  if (!fs.existsSync(file)) {
    continue;
  }

  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(find)) {
    continue;
  }

  fs.writeFileSync(file, text.replace(find, replace));
  changed += 1;
  console.log(`patched ${file}`);
}

if (changed === 0) {
  console.log('Android STL patches already applied (or packages missing).');
}
