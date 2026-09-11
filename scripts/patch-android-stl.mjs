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
