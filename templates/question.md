---
id: SIG-000
title: A short title that names the problem, not the answer
topic: signals
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [first-tag, second-tag]
---

# A short title that names the problem, not the answer

## Scenario

Set the scene in two or three sentences: the shared component library, what the component is for,
and what product teams or users have reported. Then show the code under review.

```ts verify
import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-example',
  template: `<p>{{ text() }}</p>`,
})
export class ExampleComponent {
  readonly text = input('');
}
```

## Question

**Ask one clear question in bold.** Say how many problems there are at least, or what the candidate
must produce (a fix, a design, a migration plan).

## Hints

<details>
<summary>Hint 1</summary>

A nudge that points at the first problem without naming it.

</details>

<details>
<summary>Hint 2</summary>

A stronger nudge for the hardest problem.

</details>

## Answer

### 1. Name the first problem

Explain what goes wrong, for whom, and why.

**Fix:** state the fix in one or two sentences.

### 2. Name the next problem

...

### Fixed version

```ts verify
import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-example',
  template: `<p>{{ text() }}</p>`,
})
export class ExampleComponent {
  readonly text = input.required<string>();
}
```

### What a strong candidate also mentions

- Points that separate a strong answer from an adequate one.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| First area | What a strong answer does | What a weak answer does |
| Second area | ... | ... |

## Follow-up questions

1. A question that goes deeper on the same topic.
2. A question that connects it to another topic.

## References

- [Official documentation title](https://angular.dev/)
