import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const topics = process.argv.slice(2);
for (const topic of readdirSync('instructional').filter(t => (!topics.length || topics.includes(t)) && existsSync(`instructional/${t}/examples/tsconfig.json`))) {
  console.log(`Compile ${topic}`);
  const result = spawnSync(process.execPath, ['node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js', '-p', `instructional/${topic}/examples/tsconfig.json`], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
