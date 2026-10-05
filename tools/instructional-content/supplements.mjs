import { readFileSync, writeFileSync } from 'node:fs';
const read = p => readFileSync(p, 'utf8');
let listbox = read('instructional/accessibility/examples/a11y-006-answer-0.ts');
listbox = listbox.replace("selector: 'ui-listbox'", "selector: 'lesson-listbox'").replace('export class ListboxComponent', 'export class CyclingListboxComponent');
listbox = listbox.replace('this.typed += event.key.toLocaleLowerCase();', `const char = event.key.toLocaleLowerCase();
    const repeated = this.typed.length > 0 && [...this.typed].every(value => value === char);
    this.typed = repeated ? char : this.typed + char;`);
writeFileSync('instructional/accessibility/examples/cycling-listbox.ts', listbox);
let copy = read('instructional/performance/examples/perf-001-answer-0.ts');
copy = copy.replace("selector: 'ui-copy-button'", "selector: 'lesson-copy-button'").replace('export class CopyButtonComponent', 'export class GuardedCopyButtonComponent');
copy = copy.replace("readonly text = input.required<string>();", "readonly text = input.required<string>();\n  readonly resetDelay = input(2000);");
copy = copy.replace('private timer:', 'private requestId = 0;\n  private destroyed = false;\n  private timer:');
copy = copy.replace('inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));', 'inject(DestroyRef).onDestroy(() => { this.destroyed = true; this.requestId++; clearTimeout(this.timer); });');
copy = copy.replace('clearTimeout(this.timer);\n    try', 'const request = ++this.requestId;\n    clearTimeout(this.timer);\n    try');
copy = copy.replace('} catch {\n      this.copied', '} catch {\n      if (this.destroyed || request !== this.requestId) return;\n      this.copied');
copy = copy.replace('    this.copied.set(true);', '    if (this.destroyed || request !== this.requestId) return;\n    clearTimeout(this.timer);\n    this.copied.set(true);');
copy = copy.replace('}, 2000);', '}, this.resetDelay());').replace('false), 2000);', 'false), this.resetDelay());');
writeFileSync('instructional/performance/examples/guarded-copy-button.ts', copy);
for (const [topic, file, note] of [
  ['accessibility', 'cycling-listbox.ts', 'Adds repeated-letter cycling to the original listbox reference.'],
  ['performance', 'guarded-copy-button.ts', 'Ignores stale clipboard completions and completions after destruction. The resetDelay input permits deterministic short-delay checks.'],
]) {
  const path = `instructional/${topic}/examples.md`;
  const original = read(path).split('## Supplemental example')[0];
  writeFileSync(path, original + `\n## Supplemental example\n\n[${file}](examples/${file}) — ${note}\n`);
}
