---
id: TOK-002
title: Renaming a public token in a minor release
topic: design-tokens
format: code-review
difficulty: senior
minutes: 12
angular: "20+"
tags: [design-tokens, breaking-changes, deprecation, specificity]
---

# Renaming a public token in a minor release

## Scenario

A pull request to `@acme/ui` is titled **"chore(button): rename token for consistency"** and is
labelled for the next **minor** release. The description says: "Renamed `--ui-button-bg` to
`--ui-button-background` to match our naming guidelines. Also moved the default onto `:host` so
it shows up in DevTools."

Before:

```css
.ui-button {
  background: var(--ui-button-bg, var(--ui-color-action-primary));
}
```

After:

```css
:host {
  --ui-button-background: var(--ui-color-action-primary);
}

.ui-button {
  background: var(--ui-button-background);
}
```

The button documentation lists `--ui-button-bg` as a supported customisation token. Product teams
use it like this:

```css
.checkout ui-button {
  --ui-button-bg: var(--ui-color-success);
}
```

## Question

**Would you approve this pull request?** Explain exactly what breaks for consumers, including
consumers who switch to the new name, and describe how you would ship the rename safely.

## Hints

<details>
<summary>Hint 1</summary>

What does the browser do with a custom property that nothing reads? Does anything report it?

</details>

<details>
<summary>Hint 2</summary>

Angular's emulated encapsulation rewrites `:host` into an attribute selector. Compare its
specificity with `ui-button`, and think about inheritance from `.checkout`.

</details>

## Answer

No. The change is breaking in two separate ways, and the second one also breaks the new name.

### 1. The old name silently stops working

Every product team that sets `--ui-button-bg` now gets the default colour. CSS does not fail: an
unused custom property is valid, nothing is logged, and no build or type check catches it. The
documented token was public API, so removing it requires a major release, and should come after a
deprecation period, not in a minor.

### 2. Declaring the token on `:host` blocks consumer overrides

With emulated encapsulation, `:host` compiles to an attribute selector such as `[_nghost-abc]`,
with the specificity of a class (0,1,0). Two consequences:

- **Inheritance is cut off.** `.checkout ui-button { --ui-button-background: ... }` is fine, but a
  team that sets the token on an ancestor (`.checkout { --ui-button-background: ... }`) relies on
  inheritance, and the host element now declares its own value, which wins over anything
  inherited. Theming a whole region stops working.
- **Element selectors lose.** `ui-button { --ui-button-background: red; }` has specificity
  (0,0,1) and loses to the `:host` rule. Consumers must out-specify the library, and the library's
  stylesheet is usually inserted after the application's, so equal specificity also loses.

So even teams that migrate to the new name find it does not work reliably.

**Rule:** a component *reads* its public tokens with a fallback and never *declares* them on its
host.

### How to ship the rename safely

**Minor release: add the new name and keep the old one working.**

```css
.ui-button {
  background: var(--ui-button-background, var(--ui-button-bg, var(--ui-color-action-primary)));
}
```

The new name wins when set; otherwise the old name applies; otherwise the semantic default. Order
matters: reversing the first two would let a forgotten old declaration override a team's new one.

Then make the deprecation visible, because CSS cannot warn on its own:

- Mark `--ui-button-bg` as deprecated in the documentation and the changelog, with the
  replacement and the major version that removes it.
- Keep a machine-readable list of deprecated tokens (for example `deprecations.json` with old name,
  new name and removal version). Generate the docs from it, and use it in a lint rule product
  teams can run in CI, and in an `ng update` migration that rewrites their stylesheets.
- Optionally, in development builds only, check once whether the old property is set on any
  button and log a warning that names the replacement.

**Next major release: remove the old name.** The `ng update` migration rewrites
`--ui-button-bg` to `--ui-button-background`, and the release notes list the removal under
breaking changes.

**Tests:** add visual or computed-style tests for all three cases: old name set, new name set,
neither set. These are the behaviours the release promises.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Breaking change | Recognises a renamed public token as breaking even though nothing fails to compile | Approves because "it's only CSS" |
| `:host` pitfall | Explains specificity and inheritance and states "read, never declare" | Misses that the new name is also broken |
| Migration | Fallback chain with the new name first, deprecation list, lint rule, `ng update` | Asks every team to search and replace |
| Verification | Tests the old, new and default paths | No tests for the compatibility path |

## Follow-up questions

1. A team says "just use `!important` in your fallback". Why is that worse?
2. How long should a deprecation period be for a library used by forty teams? What evidence would
   you collect before removing the old token?
3. Could registering the property with `@property` help here? What would `inherits` need to be?

## References

- [MDN: Using CSS custom properties (fallback values)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties#custom_property_fallback_values)
- [MDN: Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)
- [Angular: Style scoping and emulated encapsulation](https://angular.dev/guide/components/styling#style-scoping)
- [Angular CLI: Schematics for libraries (`ng update` migrations)](https://angular.dev/tools/cli/schematics-for-libraries)
- [Semantic Versioning 2.0.0](https://semver.org/)
