# Design Tokens: Themes, Accessibility, and Public Contracts

## A design system is a contract between teams

Welcome to the design tokens lesson. We will review four questions: raw values and token layers, renaming a public token, dark mode and forced colors, and controls that break when text grows. Before looking at those defects, we need to understand what tokens promise. A token is a named design decision that can be reused by code and design tools. Its value might be a color, a distance, a font size, or a duration. A useful name explains the role of that decision rather than its current appearance.

## A design system is a contract between teams · 2

The consumer of a shared library should be able to change a supported theme without copying a component's stylesheet. If every component chooses its own blue, radius, and spacing, a brand refresh becomes a search through unrelated code. More subtly, a dark theme can change a background without changing its foreground. The result can be technically consistent with the old stylesheet and still unreadable. Tokens let us express related decisions together and review them as a system.

## A design system is a contract between teams · 3

In an interview, do not stop at replacing hexadecimal values with variables. Explain the source of truth, the token layers, the override boundary, and how you test the result. A senior answer also considers existing consumers. A public CSS custom property is an interface even though TypeScript cannot see it. Its name, meaning, inheritance, and fallback behavior can all become dependencies for another team.

## Primitive, semantic, and component layers

Primitive tokens describe a palette or scale: a blue step, a spacing increment, or a radius. They are reusable ingredients. Semantic tokens describe intent: action background, content on an action, surface border, or disabled foreground. Components consume semantic roles so they do not need to know which palette step implements a role in each theme.

## Primitive, semantic, and component layers · 2

A component token is justified when consumers need a documented component-specific override that should not affect every use of the semantic role. A button's corner shape might be one such decision. Creating a token for every declaration is usually counterproductive. It exposes implementation details and makes future refactoring expensive. Start with reusable semantic decisions, then add component tokens when a real supported customization requires them.

## Primitive, semantic, and component layers · 3

The example separates a palette value from its purpose. In dark mode, the semantic role can point to another primitive while the component still consumes the same name. Define foreground and background roles as a pair and verify their contrast for every relevant state. A hover role, selected role, and focus indicator need deliberate design; deriving all of them with opacity can fail against a different background.

## Inheritance and override placement

CSS custom properties participate in the cascade and ordinarily inherit. A product can set a token on a theme container and descendants can consume the inherited value. This is an important part of a scoped theme: two regions on one page can use different semantic mappings without a global JavaScript toggle.

## Inheritance and override placement · 2

Be careful where you declare defaults. If a component declares its public override property directly on its host, that declaration wins over an inherited value on an ancestor. The consumer may have set the documented property correctly and still see no change. Prefer consuming a public property with a fallback to the library's semantic role. The fallback supplies a default when the consumer did not provide a value; it does not need to overwrite the consumer's inherited decision.

## Inheritance and override placement · 3

Debug this in the browser's computed styles. Check the property on the theme ancestor and on the component host, then inspect the actual background declaration. A variable's existence does not prove the component reads it. Also remember that a fallback handles a missing variable; a present value that is invalid for the consuming property can invalidate that declaration at computed-value time. Document the expected value type and test representative overrides.

## Renaming a token without losing overrides

Renaming a public token is a migration. During the compatibility period, the new name should win when supplied, the old name should still work when the new one is absent, and the library default should remain last. Put that order in the consuming declaration. Avoid defining an alias so eagerly that the old value can no longer reach the fallback.

## Renaming a token without losing overrides · 2

Test the four consumer cases: neither name, old name only, new name only, and both names. Include inherited values on a container because testing only direct host styles can hide the cascade bug. Publish the replacement, removal version, and migration examples. A token contract also includes units and meaning. Renaming a fixed height to a minimum height may improve accessibility but can change layout, so teams need to review it.

## Renaming a token without losing overrides · 3

The eventual removal belongs in a release that follows your compatibility policy. Forty teams will not all migrate on the same day. Agree on a support window, supply automated help where possible, and collect evidence of remaining uses. Do not remove an override merely because the library itself no longer uses the old name. The consumer is the reason the compatibility alias exists.

## System themes and application preferences

A theme library should not assume that every application starts in a browser or stores a preference in local storage. Server rendering, hydration, embedded applications, and scoped themes have different requirements. Let CSS handle a system color preference where possible. An explicit application choice can set a dedicated attribute without replacing unrelated classes.

## System themes and application preferences · 2

The light-dark function selects a value according to the used color scheme. A root that supports light and dark can follow the system preference, while a scoped explicit scheme can choose one. For older supported browsers, provide light defaults and a prefers-color-scheme media query, then explicit theme overrides. Check the actual browser support policy before selecting the implementation; the function is a capability, not a universal assumption.

## System themes and application preferences · 3

A stored explicit choice needs to be restored before first paint if the application wants to avoid a flash. A library can document how the application sets an attribute during server rendering or initial page setup. It should not silently choose a storage policy or overwrite body classes. When JavaScript is needed, inject the document and guard browser-only APIs; a framework service must still respect the execution environment.

## Forced colors and non-color state

Forced-colors mode changes the rules. The browser can replace author colors with system colors chosen by the user. A selected chip that differs only by a blue background may become indistinguishable from an unselected chip. Communicate selection with an additional cue such as a check mark, border, or text, and expose the same state through the appropriate ARIA attribute.

## Forced colors and non-color state · 2

Use system colors deliberately where a custom indicator needs them. Highlight and HighlightText form a system-selected pair; GrayText can express disabled text. Avoid turning off forced color adjustment for a whole component simply to preserve a brand palette. A narrowly justified adjustment must still use colors that respect the user's mode and retain a visible focus indicator.

## Forced colors and non-color state · 3

Browser emulation in CI can check that outlines, selected markers, and disabled states remain rendered. Automated checks are valuable, but they do not replace testing on an actual high contrast configuration with assistive technology. Treat a forced-colors screenshot as evidence of the tested browser state, not a certification of every platform. This distinction will matter when we discuss verification.

## Text growth, reflow, and target size

Relative font units help controls follow the user's preferred default text size. A rem is relative to the root font size. Avoid setting a fixed root size that defeats that preference. Browser zoom and an increased default font size are different mechanisms, so test both. A pixel border can be reasonable even when the text is relative; the goal is usable scaling rather than replacing every unit mechanically.

## Text growth, reflow, and target size · 2

Fixed heights, hidden overflow, and non-wrapping labels are a dangerous combination. Use minimum sizes with padding and allow the control to grow. Check long translations, two hundred percent text scaling, and the WCAG text-spacing adjustments: line height of one and a half, paragraph spacing of twice the font size, letter spacing of point one two em, and word spacing of point one six em. No text or essential operation should disappear when those values are applied.

## Text growth, reflow, and target size · 3

Separate icon size from hit target size. A small icon can sit in a much larger native button. WCAG's minimum target criterion is twenty-four CSS pixels with defined exceptions; many systems choose larger touch targets. A dense layout requires checking spacing and exception conditions, not simply claiming that twenty-four-pixel rows make every target compliant. Verify the actual clickable rectangle and neighboring targets.

## A repeatable review and verification method

Review tokens from the consumer outward. Identify the supported override, follow its fallback chain, then examine every visual state that consumes it. Include light, dark, explicit preferences, inherited scoped overrides, forced colors, disabled states, focus, enlarged text, and long labels. This matrix turns vague reports such as the theme does not work into reproducible cases.

## A repeatable review and verification method · 2

Centralize authoring where designers and engineers can review the same decisions, and generate platform artifacts rather than manually synchronizing values. The generated CSS, native platform constants, documentation, and previews should preserve semantic names. Validate references and types so a missing alias or mismatched unit fails before publication. A lint rule can prevent new raw values in component styles while allowing the intentional palette source.

## A repeatable review and verification method · 3

As we read the questions, connect every proposed correction to a failure mechanism and a regression test. Explain who owns an override and what existing consumers will observe. That combination demonstrates senior judgment: the design is coherent, the implementation respects CSS behavior, and the rollout protects teams who depend on it.

## TOK-001 · Scenario

We now review TOK-001: A button that cannot be themed. Inspect the consumer contract and identify the mechanism behind each reported defect.

## TOK-001 · Scenario

`@acme/ui` is adding a dark theme and a second brand for an acquired company. The button below does not change in either theme. A product team also complains that they had to write `.ui-button { background: ... }` in their global stylesheet to restyle a button for a campaign page, and it broke after the last library release.

## TOK-001 · Scenario

The tokens file:

## TOK-001 · Scenario · block 1 · page 1

This is the original code, part 1 of 1. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-001 · Scenario

The button's stylesheet:

## TOK-001 · Scenario · block 2 · page 1

This is the original code, part 1 of 2. Focus on background. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-001 · Scenario · block 3 · page 2

This is the original code, part 2 of 2. Focus on background. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-001 · Interview question

**Interviewer:** Why can't this button be themed, and what token structure would you put in place? Then tell me how product teams should customise it, and what is wrong with the focus style.

[pause 5s]

## TOK-001 · 1. Raw values bypass the token system

`#0b5fff`, `white`, `8px 16px`, `4px` and the font shorthand are written directly into the component. A theme can only change custom properties, so these values never change. Each one is also a copy of a decision made elsewhere, which drifts silently the next time the design team adjusts it.

## TOK-001 · 2. Components use palette tokens, which have no meaning

`--color-blue-700` names a colour, not a purpose. A dark theme cannot sensibly redefine "blue-700", and the acquired brand's primary colour is not blue at all. Themes need something to remap that describes intent. The usual answer is three layers:

## TOK-001 · 2. Components use palette tokens, which have no meaning · comparison 1

Layer: Primitive (palette). Example: `--ui-palette-blue-500: #0b5fff`. Who uses it: Only the semantic layer.

## TOK-001 · 2. Components use palette tokens, which have no meaning · comparison 2

Layer: Semantic. Example: `--ui-color-action-primary: var(--ui-palette-blue-500)`. Who uses it: Components; themes remap these.

## TOK-001 · 2. Components use palette tokens, which have no meaning · comparison 3

Layer: Component. Example: `--ui-button-background`. Who uses it: Consumers who need a documented override.

## TOK-001 · 2. Components use palette tokens, which have no meaning

A dark theme or a second brand then redefines the semantic layer only:

## TOK-001 · Answer · block 1 · page 1

This is the answer code, part 1 of 2. Read this part in the context of 2. Components use palette tokens, which have no meaning. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-001 · Answer · block 2 · page 2

This is the answer code, part 2 of 2. Read this part in the context of 2. Components use palette tokens, which have no meaning. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-001 · 2. Components use palette tokens, which have no meaning

The names are also prefixed (`--ui-`). Unprefixed names such as `--color-blue-500` collide with custom properties that product applications already define.

## TOK-001 · 3. Consumers had to style private markup

The campaign team targeted `.ui-button`, an internal class. Internal class names and DOM structure are not public API, so a refactor broke them, and the library had no way to know. The fix is to give consumers a documented hook: component-level tokens that the component reads with a fallback to the semantic token.

## TOK-001 · Answer · block 3 · page 1

This is the answer code, part 1 of 2. Focus on background. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-001 · Answer · block 4 · page 2

This is the answer code, part 2 of 2. Focus on background. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-001 · 3. Consumers had to style private markup

The campaign team now writes `.campaign ui-button { --ui-button-background: ... }`. That name is listed in the button's documentation and covered by the library's versioning policy, so renaming it later is a breaking change the library manages deliberately (see TOK-002).

## TOK-001 · 3. Consumers had to style private markup

The underscore properties (`--_background`) are private working variables. They let the danger variant change the defaults without overwriting the public tokens a consumer may have set.

## TOK-001 · 4. The focus style fails in two ways

`outline: none` plus `box-shadow`. In forced-colors mode (Windows contrast themes) the browser removes `box-shadow`, so keyboard users see no focus indicator at all. An outline survives forced colors because the browser repaints it in a system colour. - `:focus` instead of `:focus-visible`. The ring appears on every mouse click, which is why teams are tempted to remove it. `:focus-visible` shows it when the browser judges a focus indicator useful, such as keyboard navigation. The 40%-opacity ring is also unlikely to meet the 3:1 contrast required for focus indicators against both the button and the page background.

## TOK-001 · Follow-up 1

**Interviewer:** Where should token values be authored so that web, iOS and Android stay in step? What would you generate from that source?

[pause 5s]

Use a versioned token source shared by design and engineering, with typed values, semantic aliases, descriptions, and ownership. Generate CSS custom properties, native platform constants, design-tool artifacts, and documentation from it. Validate alias references and platform transformations in CI. Platforms can use different representations while preserving the same semantic role; do not assume every CSS unit transfers directly to mobile. Review generated changes with design previews so a synchronized value is also an intentional decision.

## TOK-001 · Follow-up 2

**Interviewer:** A team wants a "slightly lighter" primary button on one page. Do you add a component token, a variant, or say no? What decides it?

[pause 5s]

Ask whether the request represents a recurring supported role or a one-page exception. A reusable action variant deserves a named semantic contract and state rules. A supported component customization may justify a component token. A purely local art-direction choice can remain an application override without expanding the public API. Check foreground contrast, hover, disabled, and focus states before approving any lighter background. Avoid a variant named only after its current shade because that meaning will not survive another theme.

## TOK-001 · Follow-up 3

**Interviewer:** How would you stop raw hex values from being merged into the library again?

[pause 5s]

Lint component styles to reject raw colors outside the approved primitive token source. Use an allowlist for deliberate values such as transparent and system colors, and require review for exceptions. Validate generated token references, run theme previews and contrast checks, and teach the role-based naming model in contribution guidance. A rule that blindly forbids every hexadecimal value even in the palette source will only encourage suppressions; enforce the actual architecture boundary.

## TOK-002 · Scenario

We now review TOK-002: Renaming a public token in a minor release. Inspect the consumer contract and identify the mechanism behind each reported defect.

## TOK-002 · Scenario

A pull request to `@acme/ui` is titled "chore(button): rename token for consistency" and is labelled for the next minor release. The description says: "Renamed `--ui-button-bg` to `--ui-button-background` to match our naming guidelines. Also moved the default onto `:host` so it shows up in DevTools."

## TOK-002 · Scenario

Before:

## TOK-002 · Scenario · block 1 · page 1

This is the original code, part 1 of 1. Focus on background. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-002 · Scenario

After:

## TOK-002 · Scenario · block 2 · page 1

This is the original code, part 1 of 1. Focus on background. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-002 · Scenario

The button documentation lists `--ui-button-bg` as a supported customisation token. Product teams use it like this:

## TOK-002 · Scenario · block 3 · page 1

This is the original code, part 1 of 1. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-002 · Interview question

**Interviewer:** Would you approve this pull request? Explain exactly what breaks for consumers, including consumers who switch to the new name, and describe how you would ship the rename safely.

[pause 5s]

## TOK-002 · Answer

No. The change is breaking in two separate ways, and the second one also breaks the new name.

## TOK-002 · 1. The old name silently stops working

Every product team that sets `--ui-button-bg` now gets the default colour. CSS does not fail: an unused custom property is valid, nothing is logged, and no build or type check catches it. The documented token was public API, so removing it requires a major release, and should come after a deprecation period, not in a minor.

## TOK-002 · 2. Declaring the token on `:host` blocks consumer overrides

With emulated encapsulation, `:host` compiles to an attribute selector such as `[_nghost-abc]`, with the specificity of a class (0,1,0). Two consequences:

## TOK-002 · 2. Declaring the token on `:host` blocks consumer overrides

Inheritance is cut off. `.checkout ui-button { --ui-button-background: ... }` is fine, but a team that sets the token on an ancestor (`.checkout { --ui-button-background: ... }`) relies on inheritance, and the host element now declares its own value, which wins over anything inherited. Theming a whole region stops working. Element selectors lose. `ui-button { --ui-button-background: red; }` has specificity (0,0,1) and loses to the `:host` rule. Consumers must out-specify the library, and the library's stylesheet is usually inserted after the application's, so equal specificity also loses.

## TOK-002 · 2. Declaring the token on `:host` blocks consumer overrides

So even teams that migrate to the new name find it does not work reliably.

## TOK-002 · 2. Declaring the token on `:host` blocks consumer overrides

Rule: a component reads its public tokens with a fallback and never declares them on its host.

## TOK-002 · How to ship the rename safely

Minor release: add the new name and keep the old one working.

## TOK-002 · Answer · block 1 · page 1

This is the answer code, part 1 of 1. Focus on background. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-002 · How to ship the rename safely

The new name wins when set; otherwise the old name applies; otherwise the semantic default. Order matters: reversing the first two would let a forgotten old declaration override a team's new one.

## TOK-002 · How to ship the rename safely

Then make the deprecation visible, because CSS cannot warn on its own:

## TOK-002 · How to ship the rename safely

Mark `--ui-button-bg` as deprecated in the documentation and the changelog, with the replacement and the major version that removes it. Keep a machine-readable list of deprecated tokens (for example `deprecations.json` with old name, new name and removal version). Generate the docs from it, and use it in a lint rule product teams can run in CI, and in an `ng update` migration that rewrites their stylesheets. Optionally, in development builds only, check once whether the old property is set on any button and log a warning that names the replacement.

## TOK-002 · How to ship the rename safely

Next major release: remove the old name. The `ng update` migration rewrites `--ui-button-bg` to `--ui-button-background`, and the release notes list the removal under breaking changes.

## TOK-002 · How to ship the rename safely

Tests: add visual or computed-style tests for all three cases: old name set, new name set, neither set. These are the behaviours the release promises.

## TOK-002 · Follow-up 1

**Interviewer:** A team says "just use `!important` in your fallback". Why is that worse?

[pause 5s]

Important changes cascade priority; it does not repair the fallback order or a default declared on the wrong element. Inherited values still do not compete as direct declarations on the child. Escalating specificity makes scoped themes harder to override and creates an arms race between library and product CSS. Keep consumer override properties unset until supplied, consume the new name then the old name, and test the computed result at the component. The fallback is an expression, not a place to insert an important flag.

## TOK-002 · Follow-up 2

**Interviewer:** How long should a deprecation period be for a library used by forty teams? What evidence would you collect before removing the old token?

[pause 5s]

Choose a published window long enough for the slowest supported release cadence, with a removal major and named migration owners. For forty teams, collect repository scans, actual theme override uses, CI build results, and completion confirmations. Include applications that upgrade infrequently. Supply a codemod or guidance and track unresolved cases. Time elapsed alone is weak evidence: remove the old token when the policy permits it and consumers have a viable migration path, not merely when the library stopped referring to it.

## TOK-002 · Follow-up 3

**Interviewer:** Could registering the property with `@property` help here? What would `inherits` need to be?

[pause 5s]

Property registration can describe syntax and an initial value, but it cannot fix an incorrect cascade or decide which deprecated name wins. For a token intended to flow from theme containers into descendants, inherits normally needs to be true. A registered initial value can also make a variable present when it used to be missing, changing fallback behavior. Test that interaction before registration. Use registration when its typing or animation behavior is needed, not as a substitute for a compatibility chain.

## TOK-003 · Scenario

We now review TOK-003: Dark mode that flashes, crashes and disappears. Inspect the consumer contract and identify the mechanism behind each reported defect.

## TOK-003 · Scenario

`@acme/ui` ships a theme service and theme-aware components. Three bug reports arrive in the same week:

## TOK-003 · Scenario · item 1

1. "Our server-rendered app crashes on startup since we added the theme service."

## TOK-003 · Scenario · item 2

2. "Our page loads white, then flashes dark. And our `body` classes disappear."

## TOK-003 · Scenario · item 3

3. "With Windows contrast themes on, users cannot tell which filter chips are selected."

## TOK-003 · Scenario · block 1 · page 1

This is the original code, part 1 of 2. Focus on ThemeService, theme. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-003 · Scenario · block 2 · page 2

This is the original code, part 2 of 2. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-003 · Scenario · block 3 · page 1

This is the original code, part 1 of 2. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-003 · Scenario · block 4 · page 2

This is the original code, part 2 of 2. Focus on background, aria-pressed. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-003 · Interview question

**Interviewer:** Explain the cause of each report and redesign the theming approach. Keep in mind this is a library: it cannot assume how each application boots, renders or stores preferences.

[pause 5s]

## TOK-003 · Report 1: global browser objects crash server rendering

`window` and `document` do not exist during server-side rendering, so `window.matchMedia` throws a `ReferenceError` as soon as the service is created. Because the service is `providedIn: 'root'` and injected early, the whole application fails. A library cannot assume it only runs in a browser.

## TOK-003 · Report 1: global browser objects crash server rendering

Fix: inject `DOCUMENT`, and do not read browser-only APIs during construction.

## TOK-003 · Report 2: the flash, and the lost classes

The flash. No theme applies until JavaScript has loaded, bootstrapped, and run the effect. Until then the page has no theme class, so the light defaults show, then switch. Users with a dark system preference see this on every load. Lost classes. `document.body.className = ...` replaces every class on `body`, including the application's own. It also goes stale. The OS preference is read once. If the user's system switches to dark at sunset, the page does not follow. There is also no way to say "follow the system" after toggling.

## TOK-003 · Report 2: the flash, and the lost classes

Fix: let CSS handle the system preference, and use JavaScript only for an explicit choice.

## TOK-003 · Answer · block 1 · page 1

This is the answer code, part 1 of 1. Focus on color-scheme. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-003 · Report 2: the flash, and the lost classes

`light-dark()` picks a value based on the element's used `color-scheme`. With no attribute, the browser follows the OS preference before any script runs, so there is no flash and no stale value. `color-scheme` also makes scrollbars and native form controls match the theme.

## TOK-003 · Answer · block 2 · page 1

This is the answer code, part 1 of 2. Focus on ThemePreference, ThemeService, root, preference. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-003 · Answer · block 3 · page 2

This is the answer code, part 2 of 2. Read this part in the context of Report 2: the flash, and the lost classes. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-003 · Report 2: the flash, and the lost classes

The service touches only its own attribute on `<html>`, works on the server, and exposes the preference as a signal. Persisting the choice is the application's decision; the library documents how to restore it before first paint (for example, an inline script in `index.html` that sets `data-ui-theme` from storage, or setting it during server rendering from a cookie).

## TOK-003 · Report 3: state shown by colour alone

In forced-colors mode the browser replaces author background colours with system colours (for a `<button>`, `ButtonFace`). Both chips now look identical. This also fails WCAG 1.4.1 (Use of Color) in normal mode for users who cannot distinguish the two background colours.

## TOK-003 · Report 3: state shown by colour alone

Fix: convey state with something other than colour, and opt into system colours deliberately:

## TOK-003 · Answer · block 4 · page 1

This is the answer code, part 1 of 2. Focus on aria-pressed, background. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-003 · Answer · block 5 · page 2

This is the answer code, part 2 of 2. Read this part in the context of Report 3: state shown by colour alone. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-003 · Report 3: state shown by colour alone

The transparent border becomes visible in forced-colors mode, because the browser repaints border colours with a system colour, so every chip keeps an outline. The check mark is visual only (the empty alternative text after `/` keeps it out of the accessible name, since `aria-pressed` already conveys the state). `forced-color-adjust: none` is used only on the one rule that then uses system colours.

## TOK-003 · What a strong candidate also mentions

Contrast is a property of token pairs. Define tokens as pairs (`surface` and `on-surface`, `selected` and `on-selected`) and test every pair in every theme for 4.5:1 text contrast in CI, rather than checking components one by one. Themes can apply to a region, not just the page. Because tokens are custom properties, a `data-ui-theme` attribute on any element can work if the library supports it, but `color-scheme` must be set on that element too.

## TOK-003 · Follow-up 1

**Interviewer:** Which browsers support `light-dark()`? What is your fallback for applications that must support older ones?

[pause 5s]

Check the maintained support tables for the browser versions your applications actually support. The function is available in modern engines, but older supported versions may need light defaults, a prefers-color-scheme media query, and explicit attribute overrides. Use feature detection with supports where appropriate. Keep semantic token names identical across the modern and fallback implementations. The lesson links the support reference instead of freezing a list of browser versions that will become stale.

## TOK-003 · Follow-up 2

**Interviewer:** How would you test the forced-colors behaviour in CI?

[pause 5s]

Use browser automation to emulate forced colors and inspect selected markers, focus outlines, disabled states, and computed system colors. Capture representative screenshots with stable fonts and data. Assert the selected state is conveyed by a non-color cue and that keyboard focus remains visible. Emulation covers the browser's forced-color mode, not every operating-system palette or screen reader; retain manual checks on supported real configurations and document that limitation.

## TOK-003 · Follow-up 3

**Interviewer:** A product team wants a third "high contrast" theme. What does your token structure need for that to be a remapping rather than a fork?

[pause 5s]

Add another semantic mapping rather than duplicating component CSS. Components continue to consume surface, foreground, action, border, and focus roles. Define the high contrast mapping centrally, including interaction states, and verify paired contrast values. Scope the mapping so the application can choose it without replacing unrelated classes. Distinguish an authored high contrast theme from the user's forced-colors mode, which can still override author colors. Test the interaction of both choices.

## TOK-004 · Scenario

We now review TOK-004: Size tokens that break zoom and text spacing. Inspect the consumer contract and identify the mechanism behind each reported defect.

## TOK-004 · Scenario

An accessibility audit of a product built on `@acme/ui` reports three failures:

## TOK-004 · Scenario

With the browser's default font size set to 24px, button labels do not grow. With text spacing increased (a common user stylesheet or bookmarklet), labels are cut off. On a narrow phone, the icon buttons in the toolbar are hard to hit.

## TOK-004 · Scenario

The relevant tokens and component styles:

## TOK-004 · Scenario · block 1 · page 1

This is the original code, part 1 of 2. Focus on font-size. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-004 · Scenario · block 2 · page 2

This is the original code, part 2 of 2. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TOK-004 · Interview question

**Interviewer:** Explain each failure and fix the tokens and styles. Which WCAG success criteria are involved?

[pause 5s]

## TOK-004 · 1. Pixel font sizes ignore the user's font-size setting

`px` font sizes stay the same when a user raises the browser's default font size. Browser zoom scales them, but many users with low vision rely on the font-size setting instead, and it is the only option in some environments. `rem` is relative to the root font size, which follows the user's setting.

## TOK-004 · 1. Pixel font sizes ignore the user's font-size setting

Fix: express font sizes in `rem` (`0.875rem` is 14px at the default 16px) and line heights as unitless ratios, so they scale with the text.

## TOK-004 · 2. Fixed heights with hidden overflow cut off text

WCAG 1.4.12 (Text Spacing) requires that no content is lost when users increase line height, letter spacing, word spacing and paragraph spacing. 1.4.4 (Resize Text) requires text to scale to 200% without loss of content. A fixed `height` with `overflow: hidden` and `nowrap` guarantees clipping in both cases, and also with long translations.

## TOK-004 · 2. Fixed heights with hidden overflow cut off text

Fix: size controls with `min-height` and padding, not `height`, and let labels wrap unless there is a documented reason not to.

## TOK-004 · 3. The icon buttons are too small to hit

20 × 20 CSS pixels is below the WCAG 2.2 minimum of 24 × 24 (2.5.8 Target Size (Minimum), level AA), unless enough spacing surrounds each target. Many design systems choose 44 × 44 for touch anyway. The icon can stay small; the clickable area should not.

## TOK-004 · 3. The icon buttons are too small to hit

Fix: separate the icon size token from the target size token.

## TOK-004 · Answer · block 1 · page 1

This is the answer code, part 1 of 2. Focus on font-size. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-004 · Answer · block 2 · page 2

This is the answer code, part 2 of 2. Read this part in the context of Fixed version. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TOK-004 · What a strong candidate also mentions

Renaming `--ui-control-height` is a breaking change for teams who set it. Keep it as a deprecated alias that feeds `--ui-control-min-height` (see TOK-002), and call out in the changelog that buttons may now grow taller than before. Visual regression tests at 200% text size and with the WCAG text-spacing values applied would have caught this before release. Borders and focus rings can stay in `px`. Scaling a 1px hairline with text is rarely wanted.

## TOK-004 · Follow-up 1

**Interviewer:** Should spacing tokens be in `rem` too? What changes visually when a user increases font size?

[pause 5s]

Spacing can use rem when it should grow with text, such as control padding that protects a larger label. But not every dimension needs the same scaling policy. Borders may stay in pixels, and dense data layouts may use a distinct spacing contract. Explain which values follow font preferences and check that growing padding does not create avoidable overflow. With a larger root font, rem-based text and spacing both grow, so controls need flexible minimum dimensions rather than a fixed height.

## TOK-004 · Follow-up 2

**Interviewer:** How would you automate the text-spacing check?

[pause 5s]

Apply the WCAG text-spacing values to a representative rendered fixture: line height one point five, paragraph spacing two em, letter spacing point one two em, and word spacing point one six em. Verify text remains visible, labels can wrap, operations remain available, and containers do not clip essential content. Inspect geometry and screenshots, including long translations. Do not simply assert a stylesheet contains rem; the criterion concerns the resulting usable page. Combine this with separate text-resize and zoom checks.

## TOK-004 · Follow-up 3

**Interviewer:** A dense data grid needs 24px rows. How do you meet target-size requirements there?

[pause 5s]

Measure the actual targets and spacing. A twenty-four-pixel row height does not guarantee a twenty-four by twenty-four clickable area. Make the control's target large enough or meet the criterion's specific spacing exception, considering neighboring targets and overlapping hit areas. Keep small visual icons inside larger targets. If the design depends on another exception, document why it applies rather than treating density as an exemption. Test pointer use, keyboard operation, and text growth together.

## Final review checklist

Review the lesson by answering each main question and follow-up aloud. For Design Tokens: Themes, Accessibility, and Public Contracts, connect each reported symptom to its mechanism, explain the corrected public contract, and name a regression check that exercises the consumer path. State compatibility and accessibility limitations clearly. The linked transcript, complete code, source questions, and verification report let you repeat the exercises at your own pace.
