// Compiles every TypeScript example marked for verification with the Angular
// compiler, including strict template type checking.
//
// Mark a block for verification by adding "verify" to its info string:
//
//   ```ts verify
//   import { Component } from '@angular/core';
//   ...
//   ```
//
// Each marked block is compiled as its own module, so it must be complete:
// it needs its imports, and it must declare every type it uses. Generated
// files keep the Markdown line numbers, so an error at example-2.ts:57 points
// at line 57 of the question file.

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, loadQuestions } from './lib/questions.mjs';

const OUT = join(ROOT, '.examples');

const { questions, errors } = loadQuestions();
if (errors.length > 0) {
  console.error('Fix these problems first (run "npm run check" for details):');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const generated = [];
const problems = [];
for (const question of questions) {
  // Line numbers in the body are offset by the front matter, so recount from the whole file.
  const fileLines = question.raw.split('\n');
  let fence = null;
  let start = 0;
  let block = [];
  let count = 0;
  fileLines.forEach((line, index) => {
    if (fence === null) {
      const open = /^(`{3,})(\S*)\s*(.*)$/.exec(line);
      if (open) {
        const language = open[2];
        const verify = open[3].split(/\s+/).includes('verify');
        fence = { marker: open[1], verify: verify && ['ts', 'typescript'].includes(language) };
        if (verify && !fence.verify) problems.push(`${question.file}:${index + 1}: only ts blocks can be marked "verify"`);
        start = index + 1;
        block = [];
      }
      return;
    }
    if (line.startsWith(fence.marker) && line.slice(fence.marker.length).trim() === '') {
      if (fence.verify) {
        count += 1;
        const code = block.join('\n');
        if (!/^\s*(import|export)\s/m.test(code)) {
          problems.push(`${question.file}:${start}: a verified example must be a module with imports or exports`);
        }
        const dir = join(OUT, question.id.toLowerCase());
        mkdirSync(dir, { recursive: true });
        const path = join(dir, `example-${count}.ts`);
        // Pad with blank lines so compiler line numbers match the Markdown file.
        writeFileSync(path, `${'\n'.repeat(start)}${code}\n`);
        generated.push({ path, file: question.file });
      }
      fence = null;
      return;
    }
    block.push(line);
  });
  if (fence !== null) problems.push(`${question.file}: a code block is never closed`);
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

writeFileSync(
  join(OUT, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        noImplicitOverride: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        target: 'ES2022',
        module: 'ES2022',
        moduleResolution: 'bundler',
        lib: ['ES2023', 'DOM', 'DOM.Iterable'],
        types: [],
      },
      angularCompilerOptions: {
        strictTemplates: true,
        strictInjectionParameters: true,
        strictInputAccessModifiers: true,
      },
      include: ['**/*.ts'],
    },
    null,
    2,
  ),
);

console.log(`Compiling ${generated.length} examples from ${new Set(generated.map(g => g.file)).size} questions...`);
const result = spawnSync('npx', ['--no-install', 'ngc', '-p', join(OUT, 'tsconfig.json')], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (result.status !== 0) {
  console.error('\nExample verification failed. Generated files keep the Markdown line numbers:');
  console.error('.examples/<question-id>/example-<n>.ts:<line> is that line in the question file.');
  process.exit(result.status ?? 1);
}
console.log('All examples compile.');
