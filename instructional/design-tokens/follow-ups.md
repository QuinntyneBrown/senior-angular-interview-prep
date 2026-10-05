## TOK-001 follow-ups

### Answer 1

Use a versioned token source shared by design and engineering, with typed values, semantic aliases, descriptions, and ownership. Generate CSS custom properties, native platform constants, design-tool artifacts, and documentation from it. Validate alias references and platform transformations in CI. Platforms can use different representations while preserving the same semantic role; do not assume every CSS unit transfers directly to mobile. Review generated changes with design previews so a synchronized value is also an intentional decision.

### Answer 2

Ask whether the request represents a recurring supported role or a one-page exception. A reusable action variant deserves a named semantic contract and state rules. A supported component customization may justify a component token. A purely local art-direction choice can remain an application override without expanding the public API. Check foreground contrast, hover, disabled, and focus states before approving any lighter background. Avoid a variant named only after its current shade because that meaning will not survive another theme.

### Answer 3

Lint component styles to reject raw colors outside the approved primitive token source. Use an allowlist for deliberate values such as transparent and system colors, and require review for exceptions. Validate generated token references, run theme previews and contrast checks, and teach the role-based naming model in contribution guidance. A rule that blindly forbids every hexadecimal value even in the palette source will only encourage suppressions; enforce the actual architecture boundary.

## TOK-002 follow-ups

### Answer 1

Important changes cascade priority; it does not repair the fallback order or a default declared on the wrong element. Inherited values still do not compete as direct declarations on the child. Escalating specificity makes scoped themes harder to override and creates an arms race between library and product CSS. Keep consumer override properties unset until supplied, consume the new name then the old name, and test the computed result at the component. The fallback is an expression, not a place to insert an important flag.

### Answer 2

Choose a published window long enough for the slowest supported release cadence, with a removal major and named migration owners. For forty teams, collect repository scans, actual theme override uses, CI build results, and completion confirmations. Include applications that upgrade infrequently. Supply a codemod or guidance and track unresolved cases. Time elapsed alone is weak evidence: remove the old token when the policy permits it and consumers have a viable migration path, not merely when the library stopped referring to it.

### Answer 3

Property registration can describe syntax and an initial value, but it cannot fix an incorrect cascade or decide which deprecated name wins. For a token intended to flow from theme containers into descendants, inherits normally needs to be true. A registered initial value can also make a variable present when it used to be missing, changing fallback behavior. Test that interaction before registration. Use registration when its typing or animation behavior is needed, not as a substitute for a compatibility chain.

## TOK-003 follow-ups

### Answer 1

Check the maintained support tables for the browser versions your applications actually support. The function is available in modern engines, but older supported versions may need light defaults, a prefers-color-scheme media query, and explicit attribute overrides. Use feature detection with supports where appropriate. Keep semantic token names identical across the modern and fallback implementations. The lesson links the support reference instead of freezing a list of browser versions that will become stale.

### Answer 2

Use browser automation to emulate forced colors and inspect selected markers, focus outlines, disabled states, and computed system colors. Capture representative screenshots with stable fonts and data. Assert the selected state is conveyed by a non-color cue and that keyboard focus remains visible. Emulation covers the browser's forced-color mode, not every operating-system palette or screen reader; retain manual checks on supported real configurations and document that limitation.

### Answer 3

Add another semantic mapping rather than duplicating component CSS. Components continue to consume surface, foreground, action, border, and focus roles. Define the high contrast mapping centrally, including interaction states, and verify paired contrast values. Scope the mapping so the application can choose it without replacing unrelated classes. Distinguish an authored high contrast theme from the user's forced-colors mode, which can still override author colors. Test the interaction of both choices.

## TOK-004 follow-ups

### Answer 1

Spacing can use rem when it should grow with text, such as control padding that protects a larger label. But not every dimension needs the same scaling policy. Borders may stay in pixels, and dense data layouts may use a distinct spacing contract. Explain which values follow font preferences and check that growing padding does not create avoidable overflow. With a larger root font, rem-based text and spacing both grow, so controls need flexible minimum dimensions rather than a fixed height.

### Answer 2

Apply the WCAG text-spacing values to a representative rendered fixture: line height one point five, paragraph spacing two em, letter spacing point one two em, and word spacing point one six em. Verify text remains visible, labels can wrap, operations remain available, and containers do not clip essential content. Inspect geometry and screenshots, including long translations. Do not simply assert a stylesheet contains rem; the criterion concerns the resulting usable page. Combine this with separate text-resize and zoom checks.

### Answer 3

Measure the actual targets and spacing. A twenty-four-pixel row height does not guarantee a twenty-four by twenty-four clickable area. Make the control's target large enough or meet the criterion's specific spacing exception, considering neighboring targets and overlapping hit areas. Keep small visual icons inside larger targets. If the design depends on another exception, document why it applies rather than treating density as an exemption. Test pointer use, keyboard operation, and text growth together.
