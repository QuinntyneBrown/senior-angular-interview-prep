// Exercise budget failure and invalid selection without any paid requests.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const path = 'tools/instructional-audio/budget.json';
const original = readFileSync(path);
const budget = JSON.parse(original);
const ledger = 'tools/instructional-audio/.cache/cost-ledger.json';
const fingerprint = () => createHash('sha256').update(readFileSync(ledger)).digest('hex');
const before = fingerprint();
const env = { ...process.env }; delete env.AZURE_SPEECH_KEY;
function run(args) { return spawnSync('dotnet', ['run', 'tools/instructional-audio/generate.cs', '--', ...args, '--dry-run'], { encoding: 'utf8', env }); }
try {
  writeFileSync(path, JSON.stringify({ ...budget, additionalDollars: 0 }, null, 2));
  const blocked = run(['testing']);
  if (blocked.status === 0 || !blocked.stderr.includes('Projected cumulative usage exceeds')) throw new Error(`Budget guard did not refuse synthesis: ${blocked.stderr}`);
} finally { writeFileSync(path, original); }
const invalid = run(['nonexistent-topic']);
if (invalid.status === 0 || !invalid.stderr.includes('must match exactly one')) throw new Error('Invalid topic was not rejected');
const cached = run(['design-tokens', 'accessibility', 'component-api', 'versioning', 'testing', 'performance']);
if (cached.status !== 0 || !cached.stdout.includes('Uncached: 0 characters')) throw new Error(`Expected fully cached synthesis: ${cached.stderr}`);
if (fingerprint() !== before) throw new Error('Dry run changed spending ledger');
console.log('Budget failure, invalid topic, cache reuse, and unchanged ledger checks passed. No cloud requests.');
