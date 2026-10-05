# Senior Angular Interview Prep

Senior-level Angular interview questions and answers for developers preparing for technical interviews. The project focuses on explaining engineering decisions, tradeoffs, and practical application.

The current questions target **engineers who build a shared component library**: components that many product teams consume, where bugs and missed requirements are costly, consumers must understand the API without help, breaking changes are rare and managed, accessibility is required, and signals and design tokens are used everywhere.

## Questions

Browse the **[question index](questions/README.md)**. It lists every question with its topic, format, level and expected time.

| Topic | Covers |
| --- | --- |
| Signals and reactivity | `input`, `model`, `computed`, `linkedSignal`, `effect`, `afterRenderEffect` |
| Design tokens and theming | Token layers, tokens as public API, dark mode, forced colors, zoom and text spacing |
| Accessibility | Accessible names, dialogs, tabs, form fields, live regions, a live-coding listbox |
| Component API design | Inputs and outputs, attribute selectors, content projection, `ControlValueAccessor` |
| Versioning and breaking changes | What counts as breaking, safe deprecation, package structure |
| Testing | Testing through a host, component harnesses, accessibility checks |
| Performance and change detection | Components that work in zoneless applications |

Each question follows the same shape:

1. **Scenario:** a realistic report from product teams, and the code under review.
2. **Question:** what the candidate must find, fix or design.
3. **Hints:** collapsed, for practice.
4. **Answer:** each problem explained, a fixed version, and what strong candidates add.
5. **Scoring:** strong and weak signals for each area.
6. **Follow-up questions** and **references**.

## How to use it

- **Practising alone:** read the scenario, write your answer (out loud or on paper), use the hints only when stuck, then compare with the answer and the scoring table.
- **Running a mock interview:** pick questions from different topics until the minutes add up to your slot. A 60-minute session might be two code reviews, one discussion, and the first steps of the live-coding exercise. Use the scoring tables to give consistent feedback.

## Instructional lessons

The [instructional video series](instructional/README.md) covers all seven topics. Each lesson teaches the foundations with code, then walks through every question and follow-up answer. Video, audio, transcripts, slides, captions, measured verification, and Azure cost estimates are included.

## Content verification

TypeScript examples marked for verification are compiled with the Angular compiler and strict template type checking (`npm run verify:examples`). Answers state the minimum Angular version they assume in their front matter. Corrections are welcome; see below.

## Getting started

Browse the Markdown files on GitHub or clone the repository to read and edit them locally:

```sh
git clone https://github.com/QuinntyneBrown/senior-angular-interview-prep.git
cd senior-angular-interview-prep
npm install
npm run check
```

Reading the questions needs no installation. `npm install` is only needed to validate questions and compile examples.

## Contributing

We welcome new questions, corrections, clearer explanations, and improvements to examples. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the question format, the checks, and the pull request process. Start a new question from [`templates/question.md`](templates/question.md).

All participants are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Use [GitHub issues](https://github.com/QuinntyneBrown/senior-angular-interview-prep/issues) for content feedback and proposals. Follow the [security policy](SECURITY.md) for sensitive reports.

## Contributors

Contributions are recognized through the repository's [contributor history](https://github.com/QuinntyneBrown/senior-angular-interview-prep/graphs/contributors). See [CONTRIBUTORS.md](CONTRIBUTORS.md) for recognition guidelines and how to participate.

## Project documentation

| Document | Purpose |
| --- | --- |
| [Question index](questions/README.md) | Every question, generated from the question files |
| [Contributing](CONTRIBUTING.md) | Question format, checks, and contribution workflow |
| [Contributors](CONTRIBUTORS.md) | Contributor recognition |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community expectations and enforcement |
| [Security](SECURITY.md) | Reporting security concerns |
| [Changelog](CHANGELOG.md) | Notable changes to the project |
| [License](LICENSE) | MIT license terms |

## License

This project is licensed under the [MIT License](LICENSE).
