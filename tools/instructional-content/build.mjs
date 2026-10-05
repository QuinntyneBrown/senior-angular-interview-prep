// Build a topic, or all new topics. Signals retains its established authored build.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { lessons, followups, clarifications } from './lessons.mjs';
const selected = process.argv.slice(2);
if (selected.includes('signals')) await import('./build-signals.mjs');
const topics = selected.length ? selected.filter(t => t !== 'signals') : Object.keys(lessons);
const read = p => readFileSync(p, 'utf8').replaceAll('\r\n', '\n');
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const clean = s => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/<!--.*?-->/gs, '').replace(/\*\*/g, '').replace(/(?<!\w)\*([^*\n]+)\*/g, '$1').trim();
const section = (raw, name, end) => raw.split(`## ${name}\n`)[1]?.split(`## ${end}\n`)[0]?.trim() ?? '';
for (const topic of topics) {
  const lesson = lessons[topic];
  if (!lesson) throw new Error(`Unknown topic: ${topic}`);
  const folder = `instructional/${topic}`;
  mkdirSync(`${folder}/examples`, { recursive: true });
  const scenes = [], examples = [], excerpts = [], sources = [];
  function scene(title, prose, code, language = 'ts', part = 0) {
    scenes.push({ id: `slide-${String(scenes.length).padStart(3, '0')}`, title, prose, code: code ?? null, language, part });
  }
  lesson.foundations.forEach(([title, prose, code, language]) => {
    prose.split(/\n\s*\n/).forEach((p, i) => scene(`${title}${i ? ` · ${i + 1}` : ''}`, p, i === 1 ? code : null, language, 0));
  });
  const files = readdirSync(`questions/${topic}`).filter(f => f.endsWith('.md')).sort();
  let part = 0;
  for (const file of files) {
    part++;
    const raw = read(`questions/${topic}/${file}`);
    const id = /^id: (.+)$/m.exec(raw)[1];
    const title = /^title: (.+)$/m.exec(raw)[1].replace(/^"|"$/g, '');
    const prompts = section(raw, 'Follow-up questions', 'References').split(/\n(?=\d+\. )/).map(p => clean(p.replace(/^\d+\. /, '').replace(/\s+/g, ' '))).filter(Boolean);
    if (!followups[id] || followups[id].length !== prompts.length) throw new Error(`Missing follow-up answers for ${id}`);
    sources.push({ id, title, file, followups: prompts.length });
    scene(`${id} · Scenario`, `We now review ${id}: ${title}. Inspect the consumer contract and identify the mechanism behind each reported defect.`, null, 'ts', part);
    function content(text, stage) {
      let heading = `${id} · ${stage}`;
      let codeIndex = 0;
      for (const piece of text.split(/(```[^\n]*\n[\s\S]*?```)/g)) {
        const code = /^```([^\n]*)\n([\s\S]*?)```$/.exec(piece);
        if (code) {
          const language = code[1].split(' ')[0];
          const complete = language === 'ts' && code[1].includes('verify');
          excerpts.push({ id, stage, language, code: code[2], complete });
          if (complete) examples.push({ name: `${id.toLowerCase()}-${stage.toLowerCase()}-${codeIndex}.ts`, code: code[2], id, stage });
          const lines = code[2].trim().split('\n');
          const pages = Math.ceil(lines.length / 14);
          for (let p = 0; p < pages; p++) {
            const excerpt = lines.slice(p * 14, (p + 1) * 14).join('\n');
            const labels = [...new Set([...excerpt.matchAll(/\b(?:readonly|protected|private|export (?:class|interface|type))\s+(?:readonly\s+)?([\w]+)/g)].map(m => m[1]))].slice(0, 4);
            const attributes = [...new Set([...excerpt.matchAll(/\b(aria-[\w-]+|role|tabindex|color-scheme|background|font-size|peerDependencies)\b/g)].map(m => m[1]))].slice(0, 4);
            const focus = labels.length ? `Focus on ${labels.join(', ')}.` : attributes.length ? `Focus on ${attributes.join(', ')}.` : `Read this part in the context of ${heading.replace(`${id} · `, '')}.`;
            const note = stage === 'Scenario' ? `This is the original code, part ${p + 1} of ${pages}. ${focus} Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.` : `This is the answer code, part ${p + 1} of ${pages}. ${focus} Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.`;
            scene(`${id} · ${stage} · block ${++codeIndex} · page ${p + 1}`, note, excerpt, language, part);
          }
          continue;
        }
        for (let paragraph of piece.split(/\n\s*\n/)) {
          paragraph = clean(paragraph);
          if (!paragraph) continue;
          if (paragraph.startsWith('### ')) {
            const [h, ...body] = paragraph.split('\n');
            heading = `${id} · ${h.replace(/^#+\s*/, '')}`;
            paragraph = body.join(' ').trim();
            if (!paragraph) continue;
          }
          if (paragraph.startsWith('|')) {
            const rows = paragraph.split('\n').filter(r => !/^\|[\s|:-]+\|$/.test(r));
            const headers = rows.shift().split('|').slice(1, -1).map(x => x.trim());
            rows.forEach((r, i) => {
              const cells = r.split('|').slice(1, -1).map(x => x.trim());
              scene(`${heading} · comparison ${i + 1}`, cells.map((c, j) => `${headers[j] ?? 'Result'}: ${c}.`).join(' '), null, 'ts', part);
            });
          } else {
            const text = paragraph.replace(/\n\s*/g, ' ').replace(/^[-*] /, '').replace(/\s[-*] (?=[A-Z])/g, ' ');
            // Long enumerations receive separate scenes, retaining every item.
            const items = text.split(/(?=\s\d+\.\s)/).filter(Boolean);
            items.forEach((p, i) => scene(`${heading}${items.length > 1 ? ` · item ${i + 1}` : ''}`, p.trim(), null, 'ts', part));
          }
        }
      }
    }
    content(section(raw, 'Scenario', 'Question'), 'Scenario');
    scene(`${id} · Interview question`, `**Interviewer:** ${clean(section(raw, 'Question', 'Hints')).replace(/\s+/g, ' ')}\n\n[pause 5s]`, null, 'ts', part);
    let answer = section(raw, 'Answer', 'Scoring');
    if (topic === 'performance') answer = answer.replace(/With zone\.js, Angular runs change detection after every asynchronous task[\s\S]*?constantly\./, 'Zone-based Angular uses patched asynchronous activity as a broad check trigger. This can make plain fields appear to work, but it is not a guarantee for every promise, native asynchronous API, or callback outside the zone.');
    if (topic === 'versioning') answer = answer.replace('Changing the default from', 'A compatibility limitation: changing the default from').replace('is invisible to consumers:', 'can be invisible to ordinary template consumers:');
    content(answer, 'Answer');
    prompts.forEach((prompt, i) => {
      const prose = `**Interviewer:** ${prompt}\n\n[pause 5s]\n\n${followups[id][i]}`;
      scene(`${id} · Follow-up ${i + 1}`, prose, null, 'ts', part);

    });
  }
  for (const [title, prose] of clarifications[topic] ?? []) scene(`Implementation clarification · ${title}`, prose, null, 'ts', part + 1);
  scene('Final review checklist', `Review the lesson by answering each main question and follow-up aloud. For ${lesson.title}, connect each reported symptom to its mechanism, explain the corrected public contract, and name a regression check that exercises the consumer path. State compatibility and accessibility limitations clearly. The linked transcript, complete code, source questions, and verification report let you repeat the exercises at your own pace.`, null, 'ts', part + 1);
  writeFileSync(`${folder}/foundations.md`, `# ${lesson.title}\n\n` + lesson.foundations.map(([t, p, c, lang]) => `## ${t}\n\n${p}${c ? `\n\n\`\`\`${lang ?? 'ts'}\n${c}\n\`\`\`` : ''}\n`).join('\n'));
  writeFileSync(`${folder}/follow-ups.md`, files.map((f, i) => `## ${sources[i].id} follow-ups\n\n` + followups[sources[i].id].map((p, j) => `### Answer ${j + 1}\n\n${p}\n`).join('\n')).join('\n'));
  writeFileSync(`${folder}/script.md`, `# ${lesson.title}\n\n` + scenes.map(s => `## ${s.title}\n\n${s.prose}\n`).join('\n'));
  writeFileSync(`${folder}/scenes.json`, JSON.stringify(scenes, null, 2) + '\n');
  writeFileSync(`${folder}/lesson.json`, JSON.stringify({ topic, title: lesson.title, goals: lesson.goals, sources, pauses: sources.reduce((n, s) => n + 1 + s.followups, 0) }, null, 2) + '\n');
  for (const e of examples) writeFileSync(`${folder}/examples/${e.name}`, e.code + '\n');
  writeFileSync(`${folder}/examples/tsconfig.json`, read('instructional/signals/examples/tsconfig.json'));
  writeFileSync(`${folder}/examples.md`, '# Complete source examples\n\nThese marked complete modules are copied from the source questions. Scenario modules intentionally contain behavioral defects. Other slide excerpts are partial, including test pseudocode and package-layout sketches. Supplemental corrected modules are documented separately.\n\n' + excerpts.map((e, i) => `## ${e.id} · ${e.stage} · excerpt ${i + 1}\n\n${e.complete ? 'Complete verified TypeScript module.' : 'Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.'}\n\n\`\`\`${e.language}\n${e.code}\n\`\`\`\n`).join('\n'));
  function render(s, cue) {
    const interviewer = /^\*\*Interviewer:\*\*\s*([^\n]+)/.exec(s.prose);
    const prose = clean(s.prose).replace(/`/g, '').replace(/\[pause[^\]]+\]/g, '');
    const sentences = prose.split(/(?<=[.!?])\s+(?=[A-Z])/);
    const points = []; let length = 0;
    for (const sentence of sentences) {
      if (points.length && (length + sentence.length > 390 || points.length === 3)) break;
      points.push(sentence); length += sentence.length;
    }
    const short = points.map(p => `<li>${escape(p)}</li>`).join('');
    return `<section id="${s.id}" data-part="${s.part}"${cue ? ` data-cue="${escape(cue)}"` : ''}><div class="kicker">${s.part === 0 ? 'Foundations' : s.part > sources.length ? 'Recap and clarifications' : 'Interview walkthrough'}</div><h2>${escape(s.title.replaceAll('`', ''))}</h2>${s.code ? `<pre class="code" data-lang="${s.language}">${escape(s.code)}</pre><p class="small muted">Excerpt · consult the complete source and explanation</p>` : interviewer ? `<p class="question">${escape(interviewer[1])}</p><p class="small muted">Pause and answer aloud before the explanation.</p>` : `<ul>${short}</ul>`}</section>`;
  }
  const slides = scenes.flatMap((s, i) => {
    const output = [render(s, i ? s.title : null)];
    if (s.title.includes('Follow-up')) {
      const prose = s.prose.split('[pause 5s]')[1].trim();
      output.push(render({ ...s, id: `${s.id}-answer`, title: `${s.title} · Answer`, prose }, prose.slice(0, 80)));
    }
    return output;
  });
  const parts = ['Foundations', ...sources.map(s => s.id), 'Recap'];
  writeFileSync(`${folder}/slides.html`, `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(lesson.title)}</title><link rel="stylesheet" href="../assets/slides.css"><style>section{padding:125px 130px 140px}h2{font-size:48px;margin-bottom:25px}.kicker{font-size:23px;margin-bottom:15px}section>p,li{font-size:37px;line-height:1.45}li{margin-bottom:22px}pre.code{font-size:22px;line-height:1.38;padding:22px 30px;white-space:pre-wrap;overflow-wrap:anywhere}.question{font-size:37px;line-height:1.35}section>p.small{font-size:24px}</style></head><body data-lesson-number="${escape(topic)}" data-lesson-title="${escape(lesson.title)}" data-parts="${parts.join('|')}">\n${slides.join('\n')}\n<script src="../assets/slides.js"></script></body></html>\n`);
  console.log(`${topic}: ${slides.length} slides, ${examples.length} complete modules, ${sources.length} questions, ${sources.reduce((n, s) => n + s.followups, 0)} follow-ups.`);
}
