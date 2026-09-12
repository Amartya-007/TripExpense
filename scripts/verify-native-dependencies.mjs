import fs from 'node:fs';
import path from 'node:path';

const requiredVersions = {
  'react-native-nitro-google-signin': '1.3.0',
  'react-native-nitro-modules': '0.35.9',
};

const mismatches = [];

for (const [packageName, expectedVersion] of Object.entries(requiredVersions)) {
  const packageJsonPath = path.join('node_modules', packageName, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    mismatches.push(`${packageName} is missing`);
    continue;
  }

  const { version } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (version !== expectedVersion) {
    mismatches.push(`${packageName} is ${version}; expected ${expectedVersion}`);
  }
}

if (mismatches.length > 0) {
  console.error('Incompatible Nitro native dependency versions:');
  for (const mismatch of mismatches) console.error(`- ${mismatch}`);
  console.error('Run npm install from the project root to restore the locked versions.');
  process.exitCode = 1;
} else {
  console.log('Nitro native dependency versions are compatible.');
}
