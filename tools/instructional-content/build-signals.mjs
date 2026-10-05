// Generate narration and code slides from the authored lesson and source questions.
// No cloud calls. Run after editing foundations.md, follow-ups.md, or a source question.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
const root = 'instructional/signals';
const read = p => readFileSync(p, 'utf8').replaceAll('\r\n', '\n');
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const clean = s => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*\n]+)\*/g, '$1').replace(/<!--.*?-->/gs, '').trim();
const scenes = [];
const examples = [];
function scene(title, prose, code = null, language = 'ts', part = 0) {
  scenes.push({ id: `slide-${String(scenes.length).padStart(3, '0')}`, title, prose, code, language, part });
}
const foundationCode = {
  'Writable signals and tracked reads': "const count = signal(0);\ncount.set(3);\ncount.update(value => value + 1);\nconst label = computed(() => `Count: ${count()}`);",
  'Equality and immutable collection updates': "// Same reference: no signal notification.\nitems.update(list => { list.push('A'); return list; });\n\n// New reference: observable state transition.\nitems.update(list => [...list, 'B']);\nitems.update(list => list.filter(value => value !== 'A'));",
  'Computed values are cached derivations': "const quantity = signal(2);\nconst unitPrice = signal(12);\nconst total = computed(() => quantity() * unitPrice());\n\n// total is derived; it is not another writable store.",
  'Dynamic dependencies and narrow derivations': "const showDetails = signal(false);\nconst price = signal(12);\nconst label = computed(() =>\n  showDetails() ? `Price: ${price()}` : 'Hidden'\n);\n// price is tracked only in the branch that reads it.",
  'Inputs and construction order': "readonly options = input<readonly Option[]>([]);\n\n// Snapshot taken before the parent assigns inputs:\nreadonly selected = signal(\n  this.options().filter(option => option.selected)\n);\n// Declare dependencies instead of taking a snapshot.",
  'Linked signals for writable dependent state': "readonly selected = linkedSignal({\n  source: this.options,\n  computation: (options, previous) => {\n    if (!previous) return initialSelection(options);\n    const valid = new Set(options.map(o => o.value));\n    return previous.value.filter(v => valid.has(v));\n  },\n});",
  'Models and two-way component binding': "readonly checked = model(false);\nflip(): void {\n  this.checked.update(value => !value);\n}\n// Angular supplies the checkedChange output.\n// A local commit is different from a request.",
  'Choosing a controlled component contract': "readonly checked = input(false);\nreadonly checkedChangeRequest = output<boolean>();\n\nrequestFlip(): void {\n  this.checkedChangeRequest.emit(!this.checked());\n}\n// Render checked(); only the parent commits a value.",
  'Effects connect state to external systems': "// Feedback loop: reads and writes its own dependency.\neffect(() => {\n  selected.set(selected().filter(isValid));\n});\n\n// Derive application state; use effects at API boundaries.",
  'Cleanup is part of resource ownership': "effect(onCleanup => {\n  if (!this.open()) return;\n  const handler = (event: KeyboardEvent) => {\n    if (event.key === 'Escape') this.open.set(false);\n  };\n  document.addEventListener('keydown', handler);\n  onCleanup(() =>\n    document.removeEventListener('keydown', handler)\n  );\n});",
  'DOM work after rendering': "afterRenderEffect({\n  earlyRead: () => this.anchor().getBoundingClientRect(),\n  write: measured => {\n    const rect = measured();\n    this.panel().style.top = `${rect.bottom}px`;\n  },\n});\n// Partial excerpt: see full popover example.",
  'Row identity and accessible derived views': "readonly sortedRows = computed(() =>\n  this.rows().toSorted(this.compare())\n);\n\n// Template contracts:\n// @for (row of sortedRows(); track row.id)\n// <th [attr.aria-sort]=\"direction\">\n//   <button type=\"button\">Name</button>\n// </th>",
};
for (const block of read(`${root}/foundations.md`).split(/^## /m).slice(1)) {
  const [title, ...body] = block.split('\n');
  const paragraphs = body.join('\n').trim().split(/\n\s*\n/);
  // One slide per paragraph gives changing visual emphasis during the lesson.
  paragraphs.forEach((prose, index) => scene(index ? `${title} · ${index + 1}` : title, prose, index === 1 ? foundationCode[title] ?? null : null));
}
const codeNotes = {
  'SIG-001': [
    'The chip group renders one native button per option. Inspect the pressed-state binding and the selected lookup. Both must reflect the same current selection rather than an earlier array snapshot.',
    'Trace the field initializers. The options input is declared first, but Angular has not assigned the bound options during construction. The selected signal captures the default instead of a dependency.',
    'Inspect the effect and toggle together. The effect reads and writes selection, while toggle edits an array in place. These are different failure mechanisms: a feedback loop and a missing equality change.',
    'In the correction, the source is the options input. The first linked computation initializes from selected flags, and later computations preserve only previous identifiers still found in the current options.',
    'The corrected toggle returns a different array on every actual selection change. The output reports that user action. Read-only typing documents the boundary, but it does not freeze the emitted array at runtime.',
  ],
  'SIG-002': [
    'The template reads isOn, while the parent supplies checked. Notice that the component already has two separately stored answers to the same question before the user clicks anything.',
    'The initialization hook copies the parent only once. Flip subsequently writes the local value and emits it. A later parent reset changes checked without changing the value read by the template.',
    'The corrected template reads the model directly. The model exposes both the input and its conventional change output, so no separate isOn state or manual output declaration is necessary.',
    'The local flip commits the value immediately. That behavior is useful for ordinary two-way binding, but a parent-authorized request API must not make this local commit before approval.',
  ],
  'SIG-003': [
    'The panel exists only while open is true, and its positioning uses fixed coordinates. The effect reads both the current query result and the anchor, so the timing of the rendered panel matters.',
    'The first effect adds an anonymous document handler without an inverse operation. Every open cycle can add another closure. The second effect performs layout reads and style writes together.',
    'The corrected keyboard handler has a stable identity for this effect run. Cleanup removes exactly that handler when the run is replaced or the component is destroyed.',
    'The post-render early-read phase gathers the panel and rectangle. The write phase receives that measurement as a signal and assigns the coordinates without another layout read.',
    'This remains a teaching correction rather than a complete overlay. Scroll tracking, collision handling, topmost-layer Escape, accessible semantics, and robust focus restoration need production design.',
  ],
  'SIG-004': [
    'Inspect the header interaction and the row tracking expression. A clickable header is not a keyboard control, and tracking positions is not the same as tracking records.',
    'The computed reads the consumer array, sorts it in place, and returns a wrapper containing that same array. A view calculation has now modified a value owned by another team.',
    'The corrected header contains a native button and exposes the active sort direction. The rows use a consumer-provided stable identity so state follows records through reordering.',
    'The readonly input type rejects accidental in-place sort at compile time. A copied sorted array preserves consumer ownership, and a per-column comparator handles values according to their meaning.',
    'A new result and stable tracking do different jobs. The result represents display order, while tracking preserves row views. Upstream reference stability avoids unnecessary recalculation on unrelated checks.',
  ],
};
function addCode(code, language, question, stage, part) {
  if (language.startsWith('ts') && /\bimport\b/.test(code)) examples.push({ name: `${question.toLowerCase()}-${stage}-${examples.length}.ts`, code });
  const lines = code.trim().split('\n');
  const count = Math.ceil(lines.length / 14);
  for (let i = 0; i < count; i++) {
    const note = stage === 'Scenario'
      ? codeNotes[question][Math.min(i, codeNotes[question].length - 1)].split(/(?<=\.)\s+/)[0]
      : {
        'SIG-001': 'The correction preserves valid selections and publishes fresh arrays for user changes.',
        'SIG-002': 'The corrected model commits immediately; a controlled input instead waits for parent acceptance.',
        'SIG-003': 'The correction pairs registration with cleanup and separates geometry reads from coordinate writes.',
        'SIG-004': 'The correction preserves consumer data, tracks records, and provides accessible sorting controls.',
      }[question];
    scene(`${question} · ${stage} · code ${i + 1}/${count}`, note, lines.slice(i * 14, (i + 1) * 14).join('\n'), language.startsWith('html') ? 'html' : 'ts', part);
  }
}
function sourceScenes(text, question, stage, part) {
  let title = `${question} · ${stage}`;
  for (const piece of text.split(/(```[^\n]*\n[\s\S]*?```)/g)) {
    const code = /^```([^\n]*)\n([\s\S]*?)```$/.exec(piece);
    if (code) { addCode(code[2], code[1], question, stage, part); continue; }
    for (let paragraph of piece.split(/\n\s*\n/)) {
      paragraph = clean(paragraph);
      if (!paragraph) continue;
      if (/^###/.test(paragraph)) {
        title = `${question} · ${paragraph.replace(/^#+\s*/, '')}`;
        continue;
      }
      paragraph = paragraph.replace(/\n\s*/g, ' ');
      // Convert bullet prose to spoken sentences rather than a Markdown list.
      paragraph = paragraph.replace(/^[-*] /, '').replace(/\s[-*] (?=[A-Z])/g, ' ');
      scene(title, paragraph, null, 'ts', part);
    }
  }
}
let number = 0;
for (const file of readdirSync('questions/signals').filter(f => f.endsWith('.md')).sort()) {
  number++;
  const raw = read(`questions/signals/${file}`);
  const id = /^id: (.+)$/m.exec(raw)[1];
  const scenario = raw.split('## Scenario\n')[1].split('## Question\n')[0].trim();
  const question = clean(raw.split('## Question\n')[1].split('## Hints\n')[0]).replace(/\s+/g, ' ');
  let answer = raw.split('## Answer\n')[1].split('## Scoring\n')[0].trim();
  // Clarify source shorthand without editing the interview question files.
  answer = answer.replace('so consumers cannot\nmutate what they receive', 'to reject mutations in typed consumer code')
    .replace('[rows]="orders.filter(o => o.open)"', '[rows]="getOpenOrders()"');
  if (id === 'SIG-002') answer = answer.replace(/- \*\*Document `\[\(checked\)\]` as the supported pattern\.\*\* Consumers who need to veto a change bind a\n  signal two ways and set it back explicitly\./,
    '- **Document ordinary two-way binding as an immediate-commit contract.** A parent that must approve or reject a request needs a controlled contract. An immediate change-and-revert can leave the local model out of sync.');
  scene(`${id} · Scenario`, `We now turn to ${id}. Inspect state ownership, reactive dependencies, resource lifetimes, and the consumer contract.`, null, 'ts', number);
  sourceScenes(scenario, id, 'Scenario', number);
  scene(`${id} · Interview question`, `**Interviewer:** ${question}\n\n[pause 5s]`, null, 'ts', number);
  sourceScenes(answer, id, 'Answer', number);
  if (id === 'SIG-001') scene(`${id} · Runtime boundary`, 'A clarification about the public array: readonly is a compile-time contract, not runtime freezing. The minimal correction still emits the internal array reference. A defensive snapshot prevents a consumer from changing the component state through that emitted array. Use a copied array or a deliberately documented immutable contract where runtime isolation is required.', "this.selectionChange.emit([...this.selected()]);", 'ts', number);
  if (id === 'SIG-002') scene(`${id} · Strict parent authority`, 'A clarification about rollback: an immediate two-way accept-and-revert can leave the final parent value identical to the last bound value. The component model may therefore remain changed. Do not rely on synchronous rollback for strict authority. Use a read-only checked input and checkedChangeRequest output, with the template rendering only the accepted parent state. The separate controlled example demonstrates both acceptance and rejection.', foundationCode['Choosing a controlled component contract'], 'ts', number);
  const followup = read(`${root}/follow-ups.md`).split(`## ${id} follow-ups\n`)[1].split(/^## /m)[0].trim();
  const prompts = followup.split(/(?=\*\*Interviewer:\*\*)/).filter(x => x.trim());
  prompts.forEach((text, i) => scene(`${id} · Follow-up ${i + 1}`, text.trim(), null, 'ts', number));
}
const recap = read(`${root}/follow-ups.md`).split('## Final review checklist\n')[1].trim();
recap.split(/\n\s*\n/).forEach((prose, i) => scene(`Final review checklist · ${i + 1}`, prose, null, 'ts', 5));
const script = '# 01 · Angular Signals: State Ownership and Component Contracts\n\n' + scenes.map(s => `## ${s.title}\n\n${s.prose}\n`).join('\n');
writeFileSync(`${root}/script.md`, script);
writeFileSync(`${root}/scenes.json`, JSON.stringify(scenes, null, 2) + '\n');
mkdirSync(`${root}/examples`, { recursive: true });
for (const e of examples) writeFileSync(`${root}/examples/${e.name}`, e.code + '\n');
let sourceCode = '# Code examples\n\nFull original and corrected components are copied from the signals questions. The source questions remain authoritative. The slide excerpts are partial; use the complete modules below for compilation.\n\n';
for (const e of examples) sourceCode += `## ${e.name}\n\n\`\`\`ts\n${e.code}\n\`\`\`\n\n`;
writeFileSync(`${root}/examples.md`, sourceCode);
function visualProse(s) {
  const interviewer = /^\*\*Interviewer:\*\*\s*([^\n]+)/.exec(s.prose);
  if (interviewer) return `<p class="question">${escape(interviewer[1])}</p><p class="small muted">Pause the video, answer aloud, then compare the explanation.</p>`;
  const text = s.prose.replace(/`/g, '').replace(/\[pause[^\]]+\]/g, '').replace(/\*\*/g, '');
  const sentences = text.split(/(?<=[.!?])["']?\s+(?=[A-Z])/);
  const selected = sentences.filter(t => t.trim().length > 0).slice(0, 3);
  return `<ul>${selected.map(t => `<li>${escape(t.trim())}</li>`).join('')}</ul>`;
}
function render(s, cue) {
  return `<section id="${s.id}" data-part="${s.part}"${cue ? ` data-cue="${escape(cue)}"` : ''}><div class="kicker">${s.part === 0 ? 'Foundations' : s.part === 5 ? 'Recap' : 'Interview walkthrough'}</div><h2>${escape(s.title.replaceAll('`', ''))}</h2>${s.code ? `<pre class="code" data-lang="${s.language}">${escape(s.code)}</pre><p class="small muted">${s.part ? 'Excerpt · complete component in examples.md' : 'Teaching excerpt · see complete foundations and controlled examples'}</p>` : visualProse(s)}</section>`;
}
const visualSlides = scenes.flatMap((s, i) => {
  const slides = [render(s, i ? s.title : null)];
  // Follow-up answers get their own timed slide using the existing narration
  // paragraph as a cue. This does not require another synthesis request.
  if (s.title.includes('Follow-up')) {
    const prose = s.prose.split('[pause 5s]')[1]?.trim();
    if (prose) slides.push(render({ ...s, id: s.id + '-answer', title: s.title + ' · Answer', prose }, prose.slice(0, 80)));
  }
  return slides;
});
const sections = visualSlides.join('\n');
writeFileSync(`${root}/slides.html`, `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Angular Signals · Instructional Lesson</title><link rel="stylesheet" href="../assets/slides.css"><style>section{padding:125px 130px 140px}h2{font-size:52px;margin-bottom:25px}.kicker{font-size:23px;margin-bottom:15px}li{font-size:35px;margin-bottom:24px}pre.code{font-size:25px;line-height:1.38;padding:22px 30px}.question{font-size:42px;line-height:1.35}.small{font-size:24px}</style></head><body data-lesson-number="Signals" data-lesson-title="State Ownership and Component Contracts" data-parts="Foundations|SIG-001 Selection|SIG-002 Switch|SIG-003 Effects|SIG-004 Table|Recap">\n${sections}\n<script src="../assets/slides.js"></script></body></html>\n`);
const words = script.replace(/[#*`]/g, '').split(/\s+/).length;
console.log(`Built ${visualSlides.length} slides, ${examples.length} complete source examples, approximately ${words} narration words (${(words / 150).toFixed(1)} min before pauses).`);
