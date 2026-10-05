## Project Overview

This repository contains senior-level Angular interview questions and answers for interview preparation. The questions target engineers who build a shared component library consumed by many product teams.

## Layout

- `questions/<topic>/<id>-<slug>.md`: one question per file. Topics are listed in `questions/topics.json`.
- `questions/README.md`: the question index. It is generated; never edit it by hand.
- `templates/question.md`: the starting point for a new question.
- `scripts/`: the question checker, index generator, and example compiler (Node.js, no dependencies beyond `package.json`).

## Rules for changes

- Follow the question format and front matter in `CONTRIBUTING.md`. Section names and order are checked.
- Never reuse or renumber a question id.
- After adding or editing questions, run `npm run index`, then `npm run check` and `npm run verify:examples`, and commit the regenerated index.
- Mark complete TypeScript examples with `ts verify` so they are compiled. Scenario code should compile; its bugs should be behavioural.
- Check runtime claims in a real browser before stating them; type checking does not prove behaviour.
