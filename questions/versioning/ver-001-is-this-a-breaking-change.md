---
id: VER-001
title: Is this a breaking change?
topic: versioning
format: discussion
difficulty: senior
minutes: 12
angular: "20+"
tags: [semver, breaking-changes, public-api, hyrums-law]
---

# Is this a breaking change?

## Scenario

`@acme/ui` is at version 4.6.0 and follows semantic versioning. The release manager lists the
changes planned for the next release of `ui-select`, and asks you to decide which ones force the
next version to be 5.0.0.

```ts
// Today (4.6.0), simplified
export interface SelectOption { value: string; label: string; }

@Component({ selector: 'ui-select', /* ... */ })
export class SelectComponent {
  readonly options = input.required<SelectOption[]>();
  readonly size = input<string>('medium');
  readonly value = input<SelectOption>();
  readonly selectionChange = output<SelectOption>();
}
```

Planned changes:

1. Add an optional `placeholder` input with default `''`.
2. Add a required `label` input.
3. Change the default `size` from `'medium'` to `'small'`.
4. Narrow `size` from `string` to `'small' | 'medium' | 'large'`.
5. Widen the `value` input from `SelectOption` to `SelectOption | null`.
6. Widen the `selectionChange` payload from `SelectOption` to `SelectOption | null`.
7. Replace the internal `<div>` list with `<ul>`/`<li>` and rename internal CSS classes.
8. Darken the semantic token `--ui-color-action-primary`.
9. Make Space select the highlighted option (today only Enter does).
10. Stop exporting `SelectOptionRowComponent`, which was exported from `public-api.ts` by
    accident.
11. Switch the component to `ChangeDetectionStrategy.OnPush`.
12. Raise the `@angular/core` peer dependency from `>=20` to `>=21`.

## Question

**For each change, is it breaking, not breaking, or "it depends"? Justify each one.** Then tell
me how you would stop accidental breaking changes from reaching a release.

## Hints

<details>
<summary>Hint 1</summary>

Inputs and outputs flow in opposite directions. Does widening a type affect the code that
*writes* a value the same way as the code that *reads* it?

</details>

<details>
<summary>Hint 2</summary>

"With a sufficient number of users of an API, all observable behaviours of your system will be
depended on by somebody." Which of these changes are observable?

</details>

## Answer

A working definition: a change is breaking if a consumer who used only the **documented** public
API has to change their code, or sees behaviour they reasonably relied on change. That makes
writing down what the public API is (exports, selectors, inputs, outputs, types, tokens, keyboard
behaviour) the first job of a library team.

| # | Change | Verdict | Why |
| --- | --- | --- | --- |
| 1 | Optional input with a default | Not breaking | Existing templates compile and behave the same. |
| 2 | Required input | **Breaking** | Every existing `<ui-select>` fails to compile. Stage it: optional with a dev-mode warning in a minor, required in the next major (see A11Y-001). |
| 3 | New default `size` | **Breaking** | No compile error, but every select that relied on the default changes size. Silent visual changes are the most expensive kind. |
| 4 | Narrow `size` to a union | **Breaking** | Call sites passing other strings stop compiling. They were probably bugs, but the upgrade still fails. |
| 5 | Widen an input type | Usually not breaking | Callers *write* inputs; accepting more values breaks no caller. It *is* breaking for code that *reads* `select.value()` from a component reference, because the result can now be `null`. |
| 6 | Widen an output payload | **Breaking** | Consumers *read* outputs. A handler typed `(option: SelectOption)` now receives `null`, which strict templates reject, and untyped handlers crash at runtime. |
| 7 | Internal DOM and class names | Not breaking, *if* the policy says so | DOM structure and internal classes must be documented as private, and tests should use the library's harnesses. Still list it in the changelog: Hyrum's law says someone styled `.ui-select__row`. |
| 8 | Token value change | Not breaking API; a design change | Release it in a minor with release notes and screenshots. It must still meet contrast in every theme; screenshot tests in products will change. |
| 9 | Space selects | It depends; usually a minor fix | It aligns with the ARIA pattern, so it is a bug fix. Call it out: consumers' end-to-end tests that press Space may change. |
| 10 | Remove an accidental export | **Breaking** | Anything exported is public, whatever was intended. Deprecate it, keep exporting it until the next major, and mark it `@deprecated`. |
| 11 | Switch to `OnPush` | It depends; treat as breaking | Consumers who mutate an input array in place (`options.push(...)`) relied on default change detection; under `OnPush` the list no longer updates. |
| 12 | Raise the Angular peer range | **Breaking** | Applications on Angular 20 can no longer install it. Align with Angular's own release cadence: a new major of the library per Angular major. |

### Preventing accidental breaking changes

- **An API report in CI.** Generate a "golden" file of the public TypeScript surface (exports,
  input and output types) on every pull request, and fail when it changes without an approved
  update. Angular itself guards its packages with golden API files. A change to the golden file
  makes the breaking question visible in review.
- **Conventional commits** with `BREAKING CHANGE:` footers, and release tooling that refuses a minor
  version when one is present.
- **Visual regression tests** for every component and token, so changes like 3 and 8 are seen,
  not discovered by consumers.
- **Accessibility and keyboard tests** written against behaviour, so changes like 9 are deliberate.
- **Harnesses** shipped with the library, so consumers' tests do not depend on internal DOM
  (change 7).
- **A published policy** stating what is public and how long deprecations last.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Variance | Distinguishes widening inputs from widening outputs | Says "widening is always safe" |
| Silent changes | Flags default and `OnPush` changes as breaking without compile errors | Only counts compile errors |
| Public API definition | Says exported means public and DOM is private by policy | Argues intent ("it was internal") |
| Prevention | API golden files, commit conventions, visual and behaviour tests | "Review carefully" |

## Follow-up questions

1. A security fix requires a breaking change. How do you release it to teams who are two majors
   behind?
2. How many major versions would you support at once, and what does "support" mean?
3. Would you ever ship a breaking change in a minor release? Under what policy?

## References

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Hyrum's Law](https://www.hyrumslaw.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular: Versioning and releases](https://angular.dev/reference/releases)
- [Angular CDK: Component harnesses](https://material.angular.dev/cdk/test-harnesses/overview)
