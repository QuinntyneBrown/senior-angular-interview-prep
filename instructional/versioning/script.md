# Versioning Angular Libraries: Compatibility and Safe Migration

## Define the public contract before choosing a version

Welcome to the versioning lesson. We will classify twelve proposed changes, review an input deprecation, and repair a package that leaks internals and duplicates Angular. Semantic versioning becomes useful only when the package defines what its public contract includes. For a component library, that contract extends beyond method signatures.

## Define the public contract before choosing a version · 2

Inputs, outputs, selectors, tokens, documented DOM hooks, keyboard behavior, forms integration, defaults, peer ranges, and testing harnesses can all affect consumers. An accidental export can become an external dependency even if its author intended it to be private. A private intention does not remove a name from the package that was actually published.

## Define the public contract before choosing a version · 3

Ask whether a supported consumer that worked before can continue to work without modification. Then distinguish an intentional public promise from an unsupported dependency and consider the practical rollout. A change can be formally compatible and still deserve a visual review. A change can fix a bug and still break a workaround. State the compatibility policy instead of assuming that the word fix determines the release number.

## Input acceptance and output obligations

An input accepts values from consumers. Widening its accepted type usually permits more existing uses without invalidating them. Narrowing it can make an existing template stop compiling. A new required input forces consumers to provide information they did not previously need. An optional input with a harmless default is generally additive.

## Input acceptance and output obligations · 2

An output is different. Consumers handle the values the library emits. Widening an output to include null can break a handler that dereferences the original non-null value. The library has increased the obligations of the receiver. Do not classify input and output changes with the same rule merely because both use a union type.

## Input acceptance and output obligations · 3

Defaults also carry meaning. Changing medium to small can alter layout in every template that omitted the size. Even if no compile error appears, consumers may rely on the old visual result. Evaluate documented guarantees, snapshots, and product impact. A complete interview answer says which changes are clearly breaking and which depend on the contract, then explains the evidence that resolves each uncertain case.

## Behavior and presentation can break consumers

Switching to OnPush can expose consumers that mutate an object in place or dynamically insert a child that relies on zone-triggered checks. A keyboard change can improve conformance while changing how existing interactions behave. Internal DOM changes may be safe under a documented encapsulation policy, but tests, selectors, and custom styles can still depend on them in practice.

## Behavior and presentation can break consumers · 2

Build an inventory of supported customization points. If teams were instructed to use an internal class, it is not really internal. If the harness supplies the supported interaction API, update the harness with the component. Theme tokens need contrast and visual checks; a darker color is not automatically a breaking change or automatically harmless.

## Behavior and presentation can break consumers · 3

Raise a minimum Angular peer version only when dropping support is intentional and tested. A package that claims compatibility with a range should install and compile representative consumers across that range, including its forms and testing entry points. Passing on the newest framework alone does not validate the minimum.

## Deprecation preserves behavior while changing guidance

A deprecation introduces a supported replacement while keeping the old contract usable for an announced period. In the button rename, both inputs need an unset state so resolution can distinguish absence from an explicitly selected primary value. The new input wins, then the old input, then the default.

## Deprecation preserves behavior while changing guidance · 2

Warnings should be actionable and limited to actual deprecated usage in development. A computed derivation should stay pure. Put the diagnostic side effect in an appropriate effect and choose whether once means once per instance or once per application. Document that choice. Do not teach teams to ignore a flood of warnings from components that already use the new name.

## Deprecation preserves behavior while changing guidance · 3

Compatibility also includes direct component references. If callers read the old input getter, changing its default from primary to undefined is observable even when the rendered appearance is unchanged. State that limitation and inventory such uses. For strict compatibility, consider a distinct resolved property or a bridging API. A visual equivalence claim should not erase a public property change.

## Migrations need more than a search and replace

A template migration can rename a static kind attribute and a bound kind input when it knows the element is the library component. It should not rewrite every unrelated kind attribute in the repository. Parse templates and resolve symbols where the tooling supports it, then report uncertain cases rather than applying a destructive guess.

## Migrations need more than a search and replace · 2

Programmatic setInput calls, host directive aliases, dynamic templates, and computed property names need separate analysis. A migration can handle statically resolvable string names and known imports, while emitting a report for dynamic uses. Make migrations repeatable and test both changed and unchanged files. The report should explain the manual correction and replacement API.

## Migrations need more than a search and replace · 3

Publish a changelog, replacement examples, editor deprecation hints, and a removal version. Gather data from repository scans, CI builds, and consumer owners before removing the old contract. Runtime diagnostics can help during development, but avoid secretly transmitting consumer code or telemetry. Migration evidence should be explicit and proportionate to the organization.

## Package boundaries and peer dependencies

Angular libraries should cooperate with the application's Angular installation. Declaring Angular framework packages as ordinary runtime dependencies can allow multiple incompatible copies. That can lead to injection context and identity problems, although a specific NG0203 error still needs diagnosis rather than a one-cause assumption. Peer dependencies express the versions the consumer must supply.

## Package boundaries and peer dependencies · 2

Use explicit exports to keep the public surface deliberate. A wildcard export can publish internal helpers and component rows accidentally. Separate entry points let consumers import the feature they need, and a testing entry point can expose harnesses without making them part of the main application API. However, an entry point alone does not make a dependency optional at installation time.

## Package boundaries and peer dependencies · 3

If a date picker depends on a date library, simply moving it to a secondary entry point may improve imports and bundles but still leave a required root dependency. Making an optional peer safe requires isolating references and documenting the feature's requirement, or using a separate package. Evaluate package manager installation, TypeScript resolution, and bundling separately. They are different phases with different failure modes.

## Release gates and support policy

A release gate can compare public declarations, compile representative templates, run behavior and accessibility tests, inspect the packed artifact, and review theme snapshots. A generated API diff is useful, but it cannot understand every default or keyboard change. Combine mechanical checks with a release checklist that asks whether consumer behavior changed.

## Release gates and support policy · 2

Decide how many major lines to support according to staffing and consumer upgrade schedules. Support should state security patches, critical fixes, supported framework ranges, and the end date. A breaking security fix may need a new major and compatible backports or a documented mitigation for older lines. Communicate urgency and migration steps; do not silently redefine a minor release as breaking while claiming ordinary semantic versioning.

## Release gates and support policy · 3

Before publishing, install the packed package into a clean consumer project. Test each supported entry point without relying on monorepo path mappings. Verify peers, declarations, exports, assets, and dependency isolation. The consumer should receive the package you tested, not an internal build layout that accidentally makes missing files available.

## VER-001 · Scenario

We now review VER-001: Is this a breaking change?. Inspect the consumer contract and identify the mechanism behind each reported defect.

## VER-001 · Scenario

`@acme/ui` is at version 4.6.0 and follows semantic versioning. The release manager lists the changes planned for the next release of `ui-select`, and asks you to decide which ones force the next version to be 5.0.0.

## VER-001 · Scenario · block 1 · page 1

This is the original code, part 1 of 1. Focus on SelectOption, SelectComponent, options, size. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## VER-001 · Scenario

Planned changes:

## VER-001 · Scenario · item 1

1. Add an optional `placeholder` input with default `''`.

## VER-001 · Scenario · item 2

2. Add a required `label` input.

## VER-001 · Scenario · item 3

3. Change the default `size` from `'medium'` to `'small'`.

## VER-001 · Scenario · item 4

4. Narrow `size` from `string` to `'small' | 'medium' | 'large'`.

## VER-001 · Scenario · item 5

5. Widen the `value` input from `SelectOption` to `SelectOption | null`.

## VER-001 · Scenario · item 6

6. Widen the `selectionChange` payload from `SelectOption` to `SelectOption | null`.

## VER-001 · Scenario · item 7

7. Replace the internal `<div>` list with `<ul>`/`<li>` and rename internal CSS classes.

## VER-001 · Scenario · item 8

8. Darken the semantic token `--ui-color-action-primary`.

## VER-001 · Scenario · item 9

9. Make Space select the highlighted option (today only Enter does).

## VER-001 · Scenario · item 10

10. Stop exporting `SelectOptionRowComponent`, which was exported from `public-api.ts` by accident.

## VER-001 · Scenario · item 11

11. Switch the component to `ChangeDetectionStrategy.OnPush`.

## VER-001 · Scenario · item 12

12. Raise the `@angular/core` peer dependency from `>=20` to `>=21`.

## VER-001 · Interview question

**Interviewer:** For each change, is it breaking, not breaking, or "it depends"? Justify each one. Then tell me how you would stop accidental breaking changes from reaching a release.

[pause 5s]

## VER-001 · Answer

A working definition: a change is breaking if a consumer who used only the documented public API has to change their code, or sees behaviour they reasonably relied on change. That makes writing down what the public API is (exports, selectors, inputs, outputs, types, tokens, keyboard behaviour) the first job of a library team.

## VER-001 · Answer · comparison 1

#: 1. Change: Optional input with a default. Verdict: Not breaking. Why: Existing templates compile and behave the same..

## VER-001 · Answer · comparison 2

#: 2. Change: Required input. Verdict: Breaking. Why: Every existing `<ui-select>` fails to compile. Stage it: optional with a dev-mode warning in a minor, required in the next major (see A11Y-001)..

## VER-001 · Answer · comparison 3

#: 3. Change: New default `size`. Verdict: Breaking. Why: No compile error, but every select that relied on the default changes size. Silent visual changes are the most expensive kind..

## VER-001 · Answer · comparison 4

#: 4. Change: Narrow `size` to a union. Verdict: Breaking. Why: Call sites passing other strings stop compiling. They were probably bugs, but the upgrade still fails..

## VER-001 · Answer · comparison 5

#: 5. Change: Widen an input type. Verdict: Usually not breaking. Why: Callers write inputs; accepting more values breaks no caller. It is breaking for code that reads `select.value()` from a component reference, because the result can now be `null`..

## VER-001 · Answer · comparison 6

#: 6. Change: Widen an output payload. Verdict: Breaking. Why: Consumers read outputs. A handler typed `(option: SelectOption)` now receives `null`, which strict templates reject, and untyped handlers crash at runtime..

## VER-001 · Answer · comparison 7

#: 7. Change: Internal DOM and class names. Verdict: Not breaking, if the policy says so. Why: DOM structure and internal classes must be documented as private, and tests should use the library's harnesses. Still list it in the changelog: Hyrum's law says someone styled `.ui-select__row`..

## VER-001 · Answer · comparison 8

#: 8. Change: Token value change. Verdict: Not breaking API; a design change. Why: Release it in a minor with release notes and screenshots. It must still meet contrast in every theme; screenshot tests in products will change..

## VER-001 · Answer · comparison 9

#: 9. Change: Space selects. Verdict: It depends; usually a minor fix. Why: It aligns with the ARIA pattern, so it is a bug fix. Call it out: consumers' end-to-end tests that press Space may change..

## VER-001 · Answer · comparison 10

#: 10. Change: Remove an accidental export. Verdict: Breaking. Why: Anything exported is public, whatever was intended. Deprecate it, keep exporting it until the next major, and mark it `@deprecated`..

## VER-001 · Answer · comparison 11

#: 11. Change: Switch to `OnPush`. Verdict: It depends; treat as breaking. Why: Consumers who mutate an input array in place (`options.push(...)`) relied on default change detection; under `OnPush` the list no longer updates..

## VER-001 · Answer · comparison 12

#: 12. Change: Raise the Angular peer range. Verdict: Breaking. Why: Applications on Angular 20 can no longer install it. Align with Angular's own release cadence: a new major of the library per Angular major..

## VER-001 · Preventing accidental breaking changes

An API report in CI. Generate a "golden" file of the public TypeScript surface (exports, input and output types) on every pull request, and fail when it changes without an approved update. Angular itself guards its packages with golden API files. A change to the golden file makes the breaking question visible in review. Conventional commits with `BREAKING CHANGE:` footers, and release tooling that refuses a minor version when one is present. Visual regression tests for every component and token, so changes like 3 and 8 are seen, not discovered by consumers. Accessibility and keyboard tests written against behaviour, so changes like 9 are deliberate. Harnesses shipped with the library, so consumers' tests do not depend on internal DOM (change 7). A published policy stating what is public and how long deprecations last.

## VER-001 · Follow-up 1

**Interviewer:** A security fix requires a breaking change. How do you release it to teams who are two majors behind?

[pause 5s]

Publish the fix according to the compatibility policy and urgency. If a compatible security backport is feasible, release it on supported older majors with tests. If the fix truly requires a break, publish the new major with a focused migration and explain the risk and any temporary mitigation for teams that cannot upgrade immediately. Coordinate disclosure and support windows. Do not conceal a breaking change inside a supposedly compatible patch merely because the reason is security.

## VER-001 · Follow-up 2

**Interviewer:** How many major versions would you support at once, and what does "support" mean?

[pause 5s]

Choose the number of supported major lines from team capacity, consumer release cadence, and risk, then publish exact dates and coverage. Support might include security patches and critical regressions without new features. State supported Angular ranges and what happens after end of support. One current line and one previous line can be practical for some organizations, but it is not a universal answer. Make the commitment sustainable and measurable rather than promising every historical version indefinitely.

## VER-001 · Follow-up 3

**Interviewer:** Would you ever ship a breaking change in a minor release? Under what policy?

[pause 5s]

Under ordinary semantic versioning, a breaking change belongs in a major release. If the organization adopts an explicit exception policy, communicate it before consumers rely on minor compatibility, label the change prominently, and provide migration and risk guidance. Calling a break a bug fix does not make it compatible. Prefer a new major or a staged opt-in path. Any exception weakens the useful guarantee of minor upgrades, so explain the trade-off honestly.

## VER-002 · Scenario

We now review VER-002: A deprecation that warns everyone and honours nobody. Inspect the consumer contract and identify the mechanism behind each reported defect.

## VER-002 · Scenario

`@acme/ui` is renaming the button's `kind` input to `variant`, to match every other component. The pull request is meant to ship in a minor release, keep `kind` working, and warn teams that still use it.

## VER-002 · Scenario · block 1 · page 1

This is the original code, part 1 of 2. Focus on ButtonVariant, ButtonComponent. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## VER-002 · Scenario · block 2 · page 2

This is the original code, part 2 of 2. Focus on kind, variant, resolvedVariant. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## VER-002 · Interview question

**Interviewer:** Review the pull request. Which consumers get the wrong result, who sees the warning, and how would you ship this rename end to end?

[pause 5s]

## VER-002 · 1. Precedence is wrong, and "not set" is invisible

Both inputs default to `'primary'`, so the component cannot tell "the consumer did not set `kind`" from "the consumer set `kind="primary"`". The rule `kind() !== 'primary' ? kind() : variant()` then gives the deprecated name priority whenever it holds a non-default value:

## VER-002 · 1. Precedence is wrong, and "not set" is invisible · comparison 1

Template: `variant="danger" kind="secondary"`. Expected: `danger` (new name wins). Actual: `secondary`.

## VER-002 · 1. Precedence is wrong, and "not set" is invisible · comparison 2

Template: `kind="primary" variant="danger"`. Expected: `danger`. Actual: `danger`.

## VER-002 · 1. Precedence is wrong, and "not set" is invisible · comparison 3

Template: `kind="danger"`. Expected: `danger`. Actual: `danger`.

## VER-002 · 1. Precedence is wrong, and "not set" is invisible

A team halfway through migrating, with both attributes on some buttons, gets the old value.

## VER-002 · 1. Precedence is wrong, and "not set" is invisible

Fix: default both to `undefined`, so "not set" is observable, and resolve in one direction: `variant() ?? kind() ?? 'primary'`. The new name always wins.

## VER-002 · 2. The warning goes to everyone, repeatedly

The warning sits inside a `computed`, which has two problems:

## VER-002 · 2. The warning goes to everyone, repeatedly

It does not check whether `kind` was used at all, so every button in every application logs it, including teams that already migrated. - `computed` functions should be pure. This one logs each time it recomputes, so one page can log dozens of identical lines. Teams learn to ignore the console, and miss the warnings that matter.

## VER-002 · 2. The warning goes to everyone, repeatedly

Fix: log in development mode only, only when `kind` is actually set, and once. Include the element so developers can find the call site.

## VER-002 · 3. The rest of the rollout is missing

A deprecation is a process, not an annotation:

## VER-002 · 3. The rest of the rollout is missing

Documentation and changelog: a "Deprecations" section naming the old input, the replacement, and the major version that removes it. - `@deprecated` JSDoc (kept from the PR), which editors and linters can surface. An `ng update` migration for the next major that rewrites `kind=` and `[kind]=` to `variant` in templates, and reports anything it cannot rewrite (for example `setInput('kind', ...)`). Tests for every row of the table above, and for "warns once, only when `kind` is set". Removal in the next major, listed under breaking changes.

## VER-002 · Answer · block 1 · page 1

This is the answer code, part 1 of 3. Focus on ButtonVariant. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## VER-002 · Answer · block 2 · page 2

This is the answer code, part 2 of 3. Focus on ButtonComponent, kind, variant, resolvedVariant. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## VER-002 · Answer · block 3 · page 3

This is the answer code, part 3 of 3. Read this part in the context of Fixed version. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## VER-002 · Fixed version

Notes:

## VER-002 · Fixed version

The logging is in an `effect`, which is where side effects belong, and only exists in development mode. - `warnedAboutKind` is module-level, so an application logs the warning once, not once per button. A compatibility limitation: changing the default from `'primary'` to `undefined` can be invisible to ordinary template consumers: the resolved variant is still `'primary'` when nothing is set. Code reading `button.kind()` from a component reference would now see `undefined`; mention it in the changelog.

## VER-002 · Follow-up 1

**Interviewer:** Could `input({ alias: 'kind' })` solve this with one input? Why not?

[pause 5s]

One alias gives one public binding name for an input; it does not generally expose two independently accepted names with a documented precedence. Renaming only the TypeScript property while aliasing kind keeps the old template API rather than introducing variant alongside it. Two inputs with an unset state support both names during migration and make conflict resolution explicit. Test the public binding metadata and consumer templates instead of assuming a property rename changes both names.

## VER-002 · Follow-up 2

**Interviewer:** How would your `ng update` migration find `kind` used through `setInput` or a host directive?

[pause 5s]

Use AST and symbol analysis for known component references and statically resolvable setInput string names. Inspect directive composition metadata for exposed or renamed bindings and update templates according to the actual public name. Dynamic expressions and generated code may need a diagnostic report rather than an automatic rewrite. Keep fixtures for aliases, both-name conflicts, unrelated kind properties, and repeat runs. A safe migration reports uncertainty instead of making a broad text replacement.

## VER-002 · Follow-up 3

**Interviewer:** How do you know when it is safe to remove `kind`? What data would you collect?

[pause 5s]

Collect static usage scans, migration completion, consumer build results, and confirmations from owners within the published support window. Include direct property reads and programmatic inputs, not only templates. Development warnings can guide teams, but should not silently transmit telemetry. Remove kind in the announced major when supported consumers have a workable path, with release notes and a final migration. Lack of warnings in the library's demo is not evidence that all product teams migrated.

## VER-003 · Scenario

We now review VER-003: A package that leaks its internals and duplicates Angular. Inspect the consumer contract and identify the mechanism behind each reported defect.

## VER-003 · Scenario

These are the published `package.json` and entry point of `@acme/ui`, built with ng-packagr. Three reports came in after the last release:

## VER-003 · Scenario · item 1

1. "Upgrading `@acme/ui` broke our app with `NG0203: inject() must be called from an injection context`, and our bundle contains two copies of `@angular/core`."

## VER-003 · Scenario · item 2

2. "We only use the button, but we had to install `date-fns` and we now get its type errors in our build."

## VER-003 · Scenario · item 3

3. "You removed `domUtils` in a minor release and broke our code." (The team imports `isFocusable` from `@acme/ui`.)

## VER-003 · Scenario · block 1 · page 1

This is the original code, part 1 of 1. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## VER-003 · Scenario · block 2 · page 1

This is the original code, part 1 of 1. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## VER-003 · Interview question

**Interviewer:** Explain each report, then describe how you would structure the package and its dependencies. Which of your fixes are themselves breaking changes?

[pause 5s]

## VER-003 · Report 1: Angular as a regular dependency

Listing `@angular/core` under `dependencies` lets the package manager install a separate copy for the library whenever the application's version does not satisfy the range, or the package manager's layout keeps them apart. Two copies of Angular means two sets of injection tokens and two runtimes: the library's `inject()` calls run against a framework instance that has no active injection context, which produces `NG0203`, and the bundle carries Angular twice.

## VER-003 · Report 1: Angular as a regular dependency

Frameworks and any package whose instance must be shared (Angular, the CDK, RxJS) belong in `peerDependencies`. The application installs exactly one copy, and the package manager reports a conflict instead of silently duplicating it. `tslib` stays in `dependencies` (it is what ng-packagr's own template does).

## VER-003 · Report 2: one entry point for everything

With a single entry point, every consumer depends on every component's dependencies, types and module-level code. The button's users pay for the date picker.

## VER-003 · Report 2: one entry point for everything

Fix: secondary entry points, one per component family: `@acme/ui/button`, `@acme/ui/select`, `@acme/ui/date-picker`. ng-packagr builds each one separately, and only the date picker imports `date-fns`, which becomes an optional peer dependency.

## VER-003 · Report 3: `export *` made internals public

`export *` from `internal/dom-utils` published every function in that file. Whatever the folder name says, a symbol importable from the package is public API (see VER-001), and removing it was a breaking change in a minor release. `select-option-row.component` has the same problem.

## VER-003 · Report 3: `export *` made internals public

Fix: explicit, named exports from each entry point, so publishing something is a deliberate act, plus an API report (golden file) checked in CI so any change to the public surface is visible in review. Share internal code between entry points through a dedicated internal entry point (for example `@acme/ui/internal`) documented as having no compatibility guarantees, or keep it unexported.

## VER-003 · Answer · block 1 · page 1

This is the answer code, part 1 of 2. Focus on peerDependencies. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## VER-003 · Answer · block 2 · page 2

This is the answer code, part 2 of 2. Read this part in the context of Fixed structure. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## VER-003 · Answer · block 3 · page 1

This is the answer code, part 1 of 1. Read this part in the context of Fixed structure. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## VER-003 · Fixed structure

`"sideEffects": false` promises bundlers that importing a module has no effects of its own, so unused modules can be dropped. It is only true if no file does work at the top level (registering icons, patching globals); that must be a rule in code review.

## VER-003 · Which fixes are breaking · comparison 1

Fix: Moving Angular and the CDK to `peerDependencies`. Breaking?: No for applications, which already install them; package managers may now report conflicts they used to hide..

## VER-003 · Which fixes are breaking · comparison 2

Fix: Adding secondary entry points. Breaking?: No, if the primary entry point keeps re-exporting them for a deprecation period..

## VER-003 · Which fixes are breaking · comparison 3

Fix: Making `date-fns` an optional peer. Breaking?: Yes for date-picker users, who must now install it..

## VER-003 · Which fixes are breaking · comparison 4

Fix: Removing accidental exports. Breaking?: Yes. Deprecate first, remove in a major..

## VER-003 · Which fixes are breaking

`domUtils` itself should be restored in a patch release, deprecated, and removed in the next major. Apologise in the release notes; it was a breaking change in a minor.

## VER-003 · Follow-up 1

**Interviewer:** Which Angular versions should `@acme/ui` 5.x declare in its peer range, and how would you test that claim?

[pause 5s]

Declare only the framework versions actually supported and tested. Build a consumer matrix at the minimum and relevant releases within the range, including forms, secondary entry points, harnesses, and zoneless behavior where supported. A broad greater-than-or-equal range claims future compatibility you cannot validate. Use bounded compatible ranges when appropriate and revise them as releases are tested. Do not choose the range solely from the framework version installed in the library workspace.

## VER-003 · Follow-up 2

**Interviewer:** How would you migrate consumers from `@acme/ui` to `@acme/ui/button` imports automatically?

[pause 5s]

Resolve named imports from the root entry point and map supported symbols to their feature entry points. Split mixed imports where needed, preserve type-only imports and aliases, and update tests and documentation. Report ambiguous wildcard or dynamic imports. Validate the result against the packed package, not monorepo path mappings. Keep a root compatibility re-export during a deprecation window when feasible, then remove it in the announced major.

## VER-003 · Follow-up 3

**Interviewer:** What does a consumer see when two of their dependencies need incompatible peer ranges?

[pause 5s]

The package manager may report a peer conflict or refuse installation depending on its version and policy. Forcing installation can produce a graph outside one library's supported range, leading to build or runtime failures. Align dependency versions, upgrade a library, or use supported alternatives rather than ignoring the conflict automatically. Inspect the resolved graph and test the resulting consumer. Peer metadata communicates a constraint; it does not prove runtime compatibility by itself.

## Implementation clarification · Direct-reference compatibility

The deprecation correction changes kind() from primary to undefined when unset. Consumers reading that getter can observe the change even though the rendered default stays primary. Treat those reads as migration cases.

## Implementation clarification · Installation versus imports

Secondary entry points alone do not make date-fns optional to install. Optional peer metadata or a separate package must match the isolated feature and its declarations.

## Final review checklist

Review the lesson by answering each main question and follow-up aloud. For Versioning Angular Libraries: Compatibility and Safe Migration, connect each reported symptom to its mechanism, explain the corrected public contract, and name a regression check that exercises the consumer path. State compatibility and accessibility limitations clearly. The linked transcript, complete code, source questions, and verification report let you repeat the exercises at your own pace.
