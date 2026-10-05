# Contributing

Thank you for helping improve Senior Angular Interview Prep. Contributions should help readers explain senior-level Angular concepts accurately and apply them to realistic engineering problems.

The questions focus on engineers who build a **shared component library**: components that many product teams consume, where bugs and breaking changes are expensive, accessibility is required, and signals and design tokens are used throughout.

## Ways to contribute

- Add questions that assess reasoning, design decisions, or troubleshooting.
- Correct technical inaccuracies and outdated guidance.
- Improve explanations, examples, references, and accessibility.
- Identify missing topics or duplicate material.

For a new topic area or a substantial reorganization, open an issue to discuss the proposal before preparing a large pull request. Small corrections can be submitted directly.

## Content standards

- Use clear, professional English and descriptive Markdown headings.
- Explain why an approach works, when to use it, and its tradeoffs.
- State relevant Angular, TypeScript, or RxJS versions when behavior depends on them.
- Support technical claims with links to official documentation where available.
- Keep examples focused. Use fenced code blocks with a language identifier.
- Validate executable examples in an appropriate environment and document the version used.
- Write original explanations. Attribute quotations and respect third-party licenses.
- Exclude confidential interview material, personal information, and credentials.

Avoid presenting a context-dependent preference as a universal rule. Distinguish supported practices from deprecated behavior and historical examples.

## Adding a question

1. Pick a topic from [`questions/topics.json`](questions/topics.json). To add a topic, add an entry with a unique `key`, an upper-case `prefix`, a `title` and a `description`, and create `questions/<key>/`.
2. Copy [`templates/question.md`](templates/question.md) to `questions/<topic>/<id>-<slug>.md`, for example `questions/signals/sig-005-resource-loading-states.md`. Use the next free number for the topic's prefix.
3. Fill in the front matter and every section, as described below.
4. Run `npm run index` to validate the question and regenerate [`questions/README.md`](questions/README.md).
5. Run `npm run verify:examples` to compile the TypeScript examples.
6. Commit the question and the regenerated index together.

### Front matter

| Field | Meaning |
| --- | --- |
| `id` | `<PREFIX>-<three digits>`, unique, matching the topic's prefix. Never reuse or renumber an id; other questions refer to them. |
| `title` | A short title naming the problem. The first `#` heading must match it exactly. Quote it if it contains a colon. |
| `topic` | A `key` from `questions/topics.json`. The file must live in that topic's folder. |
| `format` | `code-review` (find and fix problems in code), `discussion` (reason about a design or decision), or `live-coding` (build something in steps). |
| `difficulty` | `senior` or `staff`. |
| `minutes` | Realistic interview time, including discussion. The index adds these up. |
| `angular` | The minimum Angular major the question assumes, quoted, for example `"20+"`. |
| `tags` | A list such as `[signals, a11y]`, shown in the index. |

### Sections

Every question uses the same sections, in this order. The checker rejects missing, unknown, or reordered sections.

| Section | Contents |
| --- | --- |
| `## Scenario` | The situation and the code under review, written as a realistic report from product teams or users. |
| `## Question` | One clear, bold question. Say how many problems to find, or what to produce. |
| `## Hints` | Optional. Collapsed `<details>` hints, weakest first. |
| `## Answer` | One `###` subsection per problem (what goes wrong, for whom, why, and the fix), then a fixed version, then what a strong candidate also mentions. |
| `## Scoring` | A table of areas with strong and weak signals, so interviewers score consistently. |
| `## Follow-up questions` | Numbered prompts that go deeper or connect to other topics. |
| `## References` | Links to official documentation and specifications. |

### Writing good questions

- **Make the scenario realistic.** Start from what product teams or users report, not from the bug's name. Real reviews start with a symptom.
- **Keep the broken code plausible.** Each problem should be one a capable engineer could miss. The scenario code should compile.
- **Explain consequences.** Say who is affected (consumers, keyboard users, screen-reader users, applications without zone.js) and how.
- **Think like a library.** Where a fix changes public API, say whether it is breaking and how to ship it.
- **Cross-reference** related questions by id (for example "see API-004") rather than repeating them.

## Verifying examples

Mark TypeScript blocks for compilation by adding `verify` to the info string:

````markdown
```ts verify
import { Component } from '@angular/core';
// ...
```
````

`npm run verify:examples` compiles every marked block with the Angular compiler and strict template type checking, against the Angular version in `package.json`. Each block is compiled as its own module, so it must include its imports and declare every type it uses. Errors are reported as `.examples/<id>/example-<n>.ts:<line>`, where `<line>` is the line in the question file.

Leave `verify` off fragments that are not complete modules, such as a single method or a test file that needs a test runner.

Type checking cannot prove behaviour. When an answer claims how something behaves at runtime (an event firing twice, a form becoming dirty), check it in a browser and describe how in your pull request.

## Local setup

Use a Node.js version allowed by `engines` in `package.json`.

```sh
npm install
npm run check            # validate questions and confirm the index is current
npm run index            # validate questions and regenerate questions/README.md
npm run verify:examples  # compile every example marked "verify"
```

Continuous integration runs `npm run check` and `npm run verify:examples` on every pull request.

## Pull request process

1. Fork the repository and create a branch for your contribution.
2. Keep the change focused on a single topic or improvement. Follow existing organization; propose a clear location if the topic is new.
3. Review spelling, Markdown formatting, links, and technical accuracy. Run the checks above.
4. Submit a pull request explaining the change, its value to readers, and how you verified it. Link related issues where applicable.
5. Address review feedback before the pull request is merged.

## Community and licensing

Follow the [Code of Conduct](CODE_OF_CONDUCT.md) in all project interactions. By submitting a contribution, you agree that your contribution is provided under the project's [MIT License](LICENSE).
