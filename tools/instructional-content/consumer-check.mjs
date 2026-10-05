// Compile actual before/after consumer templates for the versioning discussion.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const folder = resolve('instructional/versioning/.runtime/contracts');
mkdirSync(folder, { recursive: true });
function compile(name, source, angular = true) {
  const dir = `${folder}/${name}`; mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/case.ts`, source);
  writeFileSync(`${dir}/tsconfig.json`, JSON.stringify({ compilerOptions: { strict: true, noEmit: true, skipLibCheck: true, target: 'ES2022', module: 'ES2022', moduleResolution: 'bundler', types: [], lib: ['ES2023', 'DOM'] }, angularCompilerOptions: { strictTemplates: true }, files: ['case.ts'] }));
  return spawnSync(process.execPath, [angular ? 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js' : 'node_modules/typescript/bin/tsc', '-p', `${dir}/tsconfig.json`], { encoding: 'utf8' });
}
const library = (after, required = false) => `import {Component,input,output} from '@angular/core';
interface Option { value:string; label:string; }
@Component({selector:'lesson-select',template:''}) class Select {
 readonly label=${required ? 'input.required<string>()' : "input('')"};
 readonly size=input<${after ? "'small'|'medium'|'large'" : 'string'}>('medium');
 readonly value=input<Option${after ? '|null' : ''}>();
 readonly selectionChange=output<Option${after ? '|null' : ''}>();
}
`;
const host = template => `@Component({imports:[Select],template:${JSON.stringify(template)}}) class Host { handle(option:Option):void { console.log(option.label); } }`;
const results = [];
function pair(name, before, after, expectedAfter, diagnostic) {
  const old = compile(`${name}-before`, before), next = compile(`${name}-after`, after);
  if (old.status !== 0) throw new Error(`${name}: before consumer unexpectedly fails: ${old.stdout}${old.stderr}`);
  if ((next.status === 0) !== expectedAfter || (!expectedAfter && !`${next.stdout}${next.stderr}`.includes(diagnostic))) throw new Error(`${name}: unexpected after result: ${next.stdout}${next.stderr}`);
  results.push(name);
}
pair('required-input-breaks-existing-template', library(false) + host('<lesson-select/>'), library(false, true) + host('<lesson-select/>'), false, 'NG8008');
pair('narrowed-input-rejects-existing-string', library(false) + host('<lesson-select size="extra-large"/>'), library(true) + host('<lesson-select size="extra-large"/>'), false, 'TS2322');
pair('nullable-output-breaks-non-null-handler', library(false) + host('<lesson-select (selectionChange)="handle($event)"/>'), library(true) + host('<lesson-select (selectionChange)="handle($event)"/>'), false, 'TS2345');
const accepted = compile('widened-input-accepts-null', library(true) + host('<lesson-select [value]="null"/>'));
if (accepted.status !== 0) throw new Error(accepted.stderr);
const rejected = compile('old-input-rejects-null', library(false) + host('<lesson-select [value]="null"/>'));
if (rejected.status === 0 || !`${rejected.stdout}${rejected.stderr}`.includes('TS2322')) throw new Error('Input widening comparison failed');
results.push('widened-input-accepts-new-consumer');

const pkg = `${folder}/node_modules/lesson-contract`; mkdirSync(pkg, { recursive: true });
writeFileSync(`${pkg}/package.json`, JSON.stringify({ name: 'lesson-contract', version: '1.0.0', exports: { '.': './index.d.ts', './button': './button.d.ts' } }));
writeFileSync(`${pkg}/index.d.ts`, 'export interface PublicContract { value:string; }');
writeFileSync(`${pkg}/button.d.ts`, 'export interface ButtonContract { disabled:boolean; }');
writeFileSync(`${pkg}/internal.d.ts`, 'export interface InternalContract { unstable:boolean; }');
const publicConsumer = compile('public-entry-points', `import type {PublicContract} from 'lesson-contract'; import type {ButtonContract} from 'lesson-contract/button'; const value: PublicContract={value:'ok'}; const button:ButtonContract={disabled:false};`, false);
if (publicConsumer.status !== 0) throw new Error(publicConsumer.stdout);
const internalConsumer = compile('private-entry-point', `import type {InternalContract} from 'lesson-contract/internal';`, false);
if (internalConsumer.status === 0 || !internalConsumer.stdout.includes('TS2307')) throw new Error('Package exports did not block internal path');
results.push('explicit-package-exports-allow-public-and-block-internal');
writeFileSync('instructional/versioning/.runtime/consumer-check.json', JSON.stringify({ passed: results.length, assertions: results }, null, 2));
console.log(`${results.length} versioning consumer compilation and package-surface checks passed.`);
