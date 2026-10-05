---
id: VER-003
title: A package that leaks its internals and duplicates Angular
topic: versioning
format: code-review
difficulty: staff
minutes: 12
angular: "20+"
tags: [packaging, peer-dependencies, entry-points, public-api]
---

# A package that leaks its internals and duplicates Angular

## Scenario

These are the published `package.json` and entry point of `@acme/ui`, built with ng-packagr.
Three reports came in after the last release:

1. "Upgrading `@acme/ui` broke our app with `NG0203: inject() must be called from an injection
   context`, and our bundle contains two copies of `@angular/core`."
2. "We only use the button, but we had to install `date-fns` and we now get its type errors in our
   build."
3. "You removed `domUtils` in a minor release and broke our code." (The team imports
   `isFocusable` from `@acme/ui`.)

```json
{
  "name": "@acme/ui",
  "version": "4.6.0",
  "dependencies": {
    "@angular/cdk": "^20.0.0",
    "@angular/common": "^20.0.0",
    "@angular/core": "^20.0.0",
    "date-fns": "^4.1.0",
    "tslib": "^2.6.0"
  }
}
```

```ts
// projects/ui/src/public-api.ts
export * from './lib/button/button.component';
export * from './lib/select/select.component';
export * from './lib/select/select-option-row.component';
export * from './lib/date-picker/date-picker.component';
export * from './lib/internal/dom-utils';
```

## Question

**Explain each report, then describe how you would structure the package and its dependencies.
Which of your fixes are themselves breaking changes?**

## Hints

<details>
<summary>Hint 1</summary>

Who should decide which copy of `@angular/core` an application uses: the application or each
library it installs?

</details>

<details>
<summary>Hint 2</summary>

What does `export *` from an `internal` folder make public?

</details>

## Answer

### Report 1: Angular as a regular dependency

Listing `@angular/core` under `dependencies` lets the package manager install a **separate copy**
for the library whenever the application's version does not satisfy the range, or the package
manager's layout keeps them apart. Two copies of Angular means two sets of injection tokens and two
runtimes: the library's `inject()` calls run against a framework instance that has no active
injection context, which produces `NG0203`, and the bundle carries Angular twice.

Frameworks and any package whose **instance must be shared** (Angular, the CDK, RxJS) belong in
`peerDependencies`. The application installs exactly one copy, and the package manager reports a
conflict instead of silently duplicating it. `tslib` stays in `dependencies` (it is what
ng-packagr's own template does).

### Report 2: one entry point for everything

With a single entry point, every consumer depends on every component's dependencies, types and
module-level code. The button's users pay for the date picker.

**Fix:** secondary entry points, one per component family: `@acme/ui/button`,
`@acme/ui/select`, `@acme/ui/date-picker`. ng-packagr builds each one separately, and only the date
picker imports `date-fns`, which becomes an **optional** peer dependency.

### Report 3: `export *` made internals public

`export *` from `internal/dom-utils` published every function in that file. Whatever the folder
name says, a symbol importable from the package is public API (see VER-001), and removing it was a
breaking change in a minor release. `select-option-row.component` has the same problem.

**Fix:** explicit, named exports from each entry point, so publishing something is a deliberate
act, plus an API report (golden file) checked in CI so any change to the public surface is visible
in review. Share internal code between entry points through a dedicated internal entry point (for
example `@acme/ui/internal`) documented as having no compatibility guarantees, or keep it
unexported.

### Fixed structure

```json
{
  "name": "@acme/ui",
  "version": "5.0.0",
  "peerDependencies": {
    "@angular/cdk": "^20.0.0",
    "@angular/common": "^20.0.0",
    "@angular/core": "^20.0.0",
    "date-fns": "^4.1.0"
  },
  "peerDependenciesMeta": {
    "date-fns": { "optional": true }
  },
  "dependencies": {
    "tslib": "^2.6.0"
  },
  "sideEffects": false
}
```

```ts
// projects/ui/button/src/public-api.ts
export { ButtonComponent } from './button.component';
export type { ButtonVariant } from './button-variant';
```

`"sideEffects": false` promises bundlers that importing a module has no effects of its own, so
unused modules can be dropped. It is only true if no file does work at the top level (registering
icons, patching globals); that must be a rule in code review.

### Which fixes are breaking

| Fix | Breaking? |
| --- | --- |
| Moving Angular and the CDK to `peerDependencies` | No for applications, which already install them; package managers may now report conflicts they used to hide. |
| Adding secondary entry points | No, if the primary entry point keeps re-exporting them for a deprecation period. |
| Making `date-fns` an optional peer | **Yes** for date-picker users, who must now install it. |
| Removing accidental exports | **Yes.** Deprecate first, remove in a major. |

`domUtils` itself should be **restored** in a patch release, deprecated, and removed in the next
major. Apologise in the release notes; it was a breaking change in a minor.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Dependencies | Explains duplicate framework instances and moves shared packages to peers | Pins exact versions |
| Entry points | Proposes secondary entry points and optional peers | Relies on tree-shaking alone |
| Public surface | Treats every export as API; explicit exports and an API report | "It was in an internal folder" |
| Compatibility | Classifies each fix, restores the removed export | Ships everything in one major without a deprecation period |

## Follow-up questions

1. Which Angular versions should `@acme/ui` 5.x declare in its peer range, and how would you test
   that claim?
2. How would you migrate consumers from `@acme/ui` to `@acme/ui/button` imports automatically?
3. What does a consumer see when two of their dependencies need incompatible peer ranges?

## References

- [Angular: Creating libraries](https://angular.dev/tools/libraries/creating-libraries)
- [ng-packagr: Secondary entry points](https://github.com/ng-packagr/ng-packagr/blob/main/docs/secondary-entrypoints.md)
- [npm: `peerDependencies` and `peerDependenciesMeta`](https://docs.npmjs.com/cli/configuring-npm/package-json)
- [Angular error NG0203: `inject()` must be called from an injection context](https://angular.dev/errors/NG0203)
- [webpack: Tree shaking and `sideEffects`](https://webpack.js.org/guides/tree-shaking/)
