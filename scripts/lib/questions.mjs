// Loads and validates every question file under questions/.
// Shared by build-index.mjs and verify-examples.mjs.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const QUESTIONS_DIR = join(ROOT, 'questions');

export const FORMATS = ['code-review', 'discussion', 'live-coding'];
export const DIFFICULTIES = ['senior', 'staff'];
const REQUIRED_FIELDS = ['id', 'title', 'topic', 'format', 'difficulty', 'minutes', 'angular', 'tags'];

// Sections every question must contain, in this order. "Hints" is optional
// and, when present, must sit between "Question" and "Answer".
const REQUIRED_SECTIONS = ['Scenario', 'Question', 'Answer', 'Scoring', 'Follow-up questions', 'References'];
const OPTIONAL_SECTIONS = { Hints: 'Answer' };

export function loadTopics() {
  const topics = JSON.parse(readFileSync(join(QUESTIONS_DIR, 'topics.json'), 'utf8'));
  const errors = [];
  const seenKeys = new Set();
  const seenPrefixes = new Set();
  for (const topic of topics) {
    for (const field of ['key', 'prefix', 'title', 'description']) {
      if (typeof topic[field] !== 'string' || topic[field].trim() === '') {
        errors.push(`questions/topics.json: topic ${JSON.stringify(topic.key)} needs a non-empty "${field}"`);
      }
    }
    if (seenKeys.has(topic.key)) errors.push(`questions/topics.json: duplicate key "${topic.key}"`);
    if (seenPrefixes.has(topic.prefix)) errors.push(`questions/topics.json: duplicate prefix "${topic.prefix}"`);
    if (!/^[A-Z][A-Z0-9]*$/.test(topic.prefix ?? '')) {
      errors.push(`questions/topics.json: prefix "${topic.prefix}" must be upper-case letters and digits`);
    }
    seenKeys.add(topic.key);
    seenPrefixes.add(topic.prefix);
  }
  return { topics, errors };
}

export function parseFrontMatter(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { data: null, body: normalized, error: 'missing front matter' };
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) return { data: null, body: normalized, error: 'front matter is not closed with ---' };

  const data = {};
  const lines = normalized.slice(4, end).split('\n');
  for (const [index, line] of lines.entries()) {
    if (line.trim() === '') continue;
    const match = /^([a-z][a-z-]*):\s*(.*)$/.exec(line);
    if (!match) return { data: null, body: '', error: `front matter line ${index + 2} is not "key: value"` };
    const [, key, raw] = match;
    if (key in data) return { data: null, body: '', error: `front matter repeats "${key}"` };
    data[key] = parseValue(raw.trim());
  }
  return { data, body: normalized.slice(end + 5), error: null };
}

function parseValue(raw) {
  if (raw.startsWith('[') && raw.endsWith(']')) {
    const inner = raw.slice(1, -1).trim();
    return inner === '' ? [] : inner.split(',').map(item => unquote(item.trim()));
  }
  if (/^\d+$/.test(raw)) return Number(raw);
  return unquote(raw);
}

function unquote(value) {
  if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0]) {
    return value.slice(1, -1);
  }
  return value;
}

function findMarkdownFiles(dir) {
  const files = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...findMarkdownFiles(path));
    else if (name.endsWith('.md') && name !== 'README.md') files.push(path);
  }
  return files;
}

// Returns level-2 headings outside fenced code blocks.
export function sectionHeadings(body) {
  const headings = [];
  let fence = null;
  for (const line of body.split('\n')) {
    const fenceMatch = /^(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1];
      else if (line.startsWith(fence) && line.slice(fence.length).trim() === '') fence = null;
      continue;
    }
    if (fence === null && line.startsWith('## ')) headings.push(line.slice(3).trim());
  }
  return headings;
}

function validateSections(headings) {
  const errors = [];
  const known = new Set([...REQUIRED_SECTIONS, ...Object.keys(OPTIONAL_SECTIONS)]);
  for (const heading of headings) {
    if (!known.has(heading)) errors.push(`unexpected section "## ${heading}"`);
  }
  for (const heading of known) {
    if (headings.filter(h => h === heading).length > 1) errors.push(`section "## ${heading}" appears more than once`);
  }
  for (const heading of REQUIRED_SECTIONS) {
    if (!headings.includes(heading)) errors.push(`missing section "## ${heading}"`);
  }
  const order = headings.filter(h => REQUIRED_SECTIONS.includes(h));
  const expected = REQUIRED_SECTIONS.filter(h => headings.includes(h));
  if (order.join('|') !== expected.join('|')) {
    errors.push(`sections must appear in this order: ${REQUIRED_SECTIONS.join(', ')}`);
  }
  for (const [optional, before] of Object.entries(OPTIONAL_SECTIONS)) {
    const at = headings.indexOf(optional);
    if (at !== -1 && (at < headings.indexOf('Question') || at > headings.indexOf(before))) {
      errors.push(`section "## ${optional}" must sit between "## Question" and "## ${before}"`);
    }
  }
  return errors;
}

export function loadQuestions() {
  const { topics, errors } = loadTopics();
  const byKey = new Map(topics.map(topic => [topic.key, topic]));
  const questions = [];
  const ids = new Map();

  for (const path of findMarkdownFiles(QUESTIONS_DIR)) {
    const file = relative(ROOT, path).split(sep).join('/');
    const fail = message => errors.push(`${file}: ${message}`);
    const text = readFileSync(path, 'utf8');
    const { data, body, error } = parseFrontMatter(text);
    if (error) {
      fail(error);
      continue;
    }

    for (const field of REQUIRED_FIELDS) {
      if (!(field in data)) fail(`front matter is missing "${field}"`);
    }
    for (const field of Object.keys(data)) {
      if (!REQUIRED_FIELDS.includes(field)) fail(`front matter has unknown field "${field}"`);
    }

    const topic = byKey.get(data.topic);
    const folder = file.split('/')[1];
    if (!topic) fail(`topic "${data.topic}" is not listed in questions/topics.json`);
    else {
      if (folder !== topic.key) fail(`topic "${topic.key}" questions belong in questions/${topic.key}/`);
      if (!new RegExp(`^${topic.prefix}-\\d{3}$`).test(String(data.id))) {
        fail(`id "${data.id}" must look like ${topic.prefix}-001 for topic "${topic.key}"`);
      }
    }

    const fileName = file.split('/').at(-1);
    const expectedStart = `${String(data.id).toLowerCase()}-`;
    if (!fileName.startsWith(expectedStart) || !/^[a-z0-9]+-\d{3}(-[a-z0-9]+)+\.md$/.test(fileName)) {
      fail(`file name must be "${expectedStart}<kebab-case-slug>.md"`);
    }

    if (ids.has(data.id)) fail(`id "${data.id}" is already used by ${ids.get(data.id)}`);
    ids.set(data.id, file);

    if (!FORMATS.includes(data.format)) fail(`format must be one of: ${FORMATS.join(', ')}`);
    if (!DIFFICULTIES.includes(data.difficulty)) fail(`difficulty must be one of: ${DIFFICULTIES.join(', ')}`);
    if (!Number.isInteger(data.minutes) || data.minutes < 1 || data.minutes > 90) {
      fail('minutes must be a whole number from 1 to 90');
    }
    if (typeof data.title !== 'string' || data.title === '') fail('title must be a non-empty string');
    if (typeof data.angular !== 'string' || !/^\d+\+$/.test(data.angular)) {
      fail('angular must be a quoted minimum major version such as "20+"');
    }
    if (!Array.isArray(data.tags) || data.tags.length === 0) fail('tags must be a non-empty list such as [signals, a11y]');

    const h1 = /^# (.+)$/m.exec(body);
    if (!h1 || h1[1].trim() !== data.title) fail(`the first "# " heading must match the title "${data.title}"`);

    for (const message of validateSections(sectionHeadings(body))) fail(message);

    questions.push({ ...data, file, body, raw: text.replace(/\r\n/g, '\n') });
  }

  return { topics, questions, errors };
}
