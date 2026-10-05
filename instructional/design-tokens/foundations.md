# Design Tokens: Themes, Accessibility, and Public Contracts

## A design system is a contract between teams

Welcome to the design tokens lesson. We will review four questions: raw values and token layers, renaming a public token, dark mode and forced colors, and controls that break when text grows. Before looking at those defects, we need to understand what tokens promise. A token is a named design decision that can be reused by code and design tools. Its value might be a color, a distance, a font size, or a duration. A useful name explains the role of that decision rather than its current appearance.

The consumer of a shared library should be able to change a supported theme without copying a component's stylesheet. If every component chooses its own blue, radius, and spacing, a brand refresh becomes a search through unrelated code. More subtly, a dark theme can change a background without changing its foreground. The result can be technically consistent with the old stylesheet and still unreadable. Tokens let us express related decisions together and review them as a system.

In an interview, do not stop at replacing hexadecimal values with variables. Explain the source of truth, the token layers, the override boundary, and how you test the result. A senior answer also considers existing consumers. A public CSS custom property is an interface even though TypeScript cannot see it. Its name, meaning, inheritance, and fallback behavior can all become dependencies for another team.

## Primitive, semantic, and component layers

Primitive tokens describe a palette or scale: a blue step, a spacing increment, or a radius. They are reusable ingredients. Semantic tokens describe intent: action background, content on an action, surface border, or disabled foreground. Components consume semantic roles so they do not need to know which palette step implements a role in each theme.

A component token is justified when consumers need a documented component-specific override that should not affect every use of the semantic role. A button's corner shape might be one such decision. Creating a token for every declaration is usually counterproductive. It exposes implementation details and makes future refactoring expensive. Start with reusable semantic decisions, then add component tokens when a real supported customization requires them.

The example separates a palette value from its purpose. In dark mode, the semantic role can point to another primitive while the component still consumes the same name. Define foreground and background roles as a pair and verify their contrast for every relevant state. A hover role, selected role, and focus indicator need deliberate design; deriving all of them with opacity can fail against a different background.

```css
:root {
  --ui-blue-600: #2457c5;
  --ui-color-action: var(--ui-blue-600);
  --ui-color-on-action: #fff;
}
.ui-button {
  background: var(--ui-button-bg, var(--ui-color-action));
  color: var(--ui-color-on-action);
}
```

## Inheritance and override placement

CSS custom properties participate in the cascade and ordinarily inherit. A product can set a token on a theme container and descendants can consume the inherited value. This is an important part of a scoped theme: two regions on one page can use different semantic mappings without a global JavaScript toggle.

Be careful where you declare defaults. If a component declares its public override property directly on its host, that declaration wins over an inherited value on an ancestor. The consumer may have set the documented property correctly and still see no change. Prefer consuming a public property with a fallback to the library's semantic role. The fallback supplies a default when the consumer did not provide a value; it does not need to overwrite the consumer's inherited decision.

Debug this in the browser's computed styles. Check the property on the theme ancestor and on the component host, then inspect the actual background declaration. A variable's existence does not prove the component reads it. Also remember that a fallback handles a missing variable; a present value that is invalid for the consuming property can invalidate that declaration at computed-value time. Document the expected value type and test representative overrides.

## Renaming a token without losing overrides

Renaming a public token is a migration. During the compatibility period, the new name should win when supplied, the old name should still work when the new one is absent, and the library default should remain last. Put that order in the consuming declaration. Avoid defining an alias so eagerly that the old value can no longer reach the fallback.

Test the four consumer cases: neither name, old name only, new name only, and both names. Include inherited values on a container because testing only direct host styles can hide the cascade bug. Publish the replacement, removal version, and migration examples. A token contract also includes units and meaning. Renaming a fixed height to a minimum height may improve accessibility but can change layout, so teams need to review it.

The eventual removal belongs in a release that follows your compatibility policy. Forty teams will not all migrate on the same day. Agree on a support window, supply automated help where possible, and collect evidence of remaining uses. Do not remove an override merely because the library itself no longer uses the old name. The consumer is the reason the compatibility alias exists.

```css
.ui-button {
  background: var(--ui-button-background,
    var(--ui-button-bg, var(--ui-color-action)));
}
/* New name, then deprecated name, then default. */
```

## System themes and application preferences

A theme library should not assume that every application starts in a browser or stores a preference in local storage. Server rendering, hydration, embedded applications, and scoped themes have different requirements. Let CSS handle a system color preference where possible. An explicit application choice can set a dedicated attribute without replacing unrelated classes.

The light-dark function selects a value according to the used color scheme. A root that supports light and dark can follow the system preference, while a scoped explicit scheme can choose one. For older supported browsers, provide light defaults and a prefers-color-scheme media query, then explicit theme overrides. Check the actual browser support policy before selecting the implementation; the function is a capability, not a universal assumption.

A stored explicit choice needs to be restored before first paint if the application wants to avoid a flash. A library can document how the application sets an attribute during server rendering or initial page setup. It should not silently choose a storage policy or overwrite body classes. When JavaScript is needed, inject the document and guard browser-only APIs; a framework service must still respect the execution environment.

## Forced colors and non-color state

Forced-colors mode changes the rules. The browser can replace author colors with system colors chosen by the user. A selected chip that differs only by a blue background may become indistinguishable from an unselected chip. Communicate selection with an additional cue such as a check mark, border, or text, and expose the same state through the appropriate ARIA attribute.

Use system colors deliberately where a custom indicator needs them. Highlight and HighlightText form a system-selected pair; GrayText can express disabled text. Avoid turning off forced color adjustment for a whole component simply to preserve a brand palette. A narrowly justified adjustment must still use colors that respect the user's mode and retain a visible focus indicator.

Browser emulation in CI can check that outlines, selected markers, and disabled states remain rendered. Automated checks are valuable, but they do not replace testing on an actual high contrast configuration with assistive technology. Treat a forced-colors screenshot as evidence of the tested browser state, not a certification of every platform. This distinction will matter when we discuss verification.

## Text growth, reflow, and target size

Relative font units help controls follow the user's preferred default text size. A rem is relative to the root font size. Avoid setting a fixed root size that defeats that preference. Browser zoom and an increased default font size are different mechanisms, so test both. A pixel border can be reasonable even when the text is relative; the goal is usable scaling rather than replacing every unit mechanically.

Fixed heights, hidden overflow, and non-wrapping labels are a dangerous combination. Use minimum sizes with padding and allow the control to grow. Check long translations, two hundred percent text scaling, and the WCAG text-spacing adjustments: line height of one and a half, paragraph spacing of twice the font size, letter spacing of point one two em, and word spacing of point one six em. No text or essential operation should disappear when those values are applied.

Separate icon size from hit target size. A small icon can sit in a much larger native button. WCAG's minimum target criterion is twenty-four CSS pixels with defined exceptions; many systems choose larger touch targets. A dense layout requires checking spacing and exception conditions, not simply claiming that twenty-four-pixel rows make every target compliant. Verify the actual clickable rectangle and neighboring targets.

```css
.ui-icon-button {
  min-inline-size: 2.75rem;
  min-block-size: 2.75rem;
  padding: .5rem;
  font-size: .875rem;
  line-height: 1.5;
}
/* The icon can be smaller than its button. */
```

## A repeatable review and verification method

Review tokens from the consumer outward. Identify the supported override, follow its fallback chain, then examine every visual state that consumes it. Include light, dark, explicit preferences, inherited scoped overrides, forced colors, disabled states, focus, enlarged text, and long labels. This matrix turns vague reports such as the theme does not work into reproducible cases.

Centralize authoring where designers and engineers can review the same decisions, and generate platform artifacts rather than manually synchronizing values. The generated CSS, native platform constants, documentation, and previews should preserve semantic names. Validate references and types so a missing alias or mismatched unit fails before publication. A lint rule can prevent new raw values in component styles while allowing the intentional palette source.

As we read the questions, connect every proposed correction to a failure mechanism and a regression test. Explain who owns an override and what existing consumers will observe. That combination demonstrates senior judgment: the design is coherent, the implementation respects CSS behavior, and the rollout protects teams who depend on it.
