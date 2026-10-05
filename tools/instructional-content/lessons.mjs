// Authored teaching material. Source scenarios and main answers come from questions/.
// Each foundation has a title, spoken explanation, and an optional visual excerpt.
export const lessons = {
  'design-tokens': {
    title: 'Design Tokens: Themes, Accessibility, and Public Contracts',
    goals: 'Design token layers, manage CSS inheritance and migrations, support themes and forced colors, and preserve usable text and targets.',
    foundations: [
      ['A design system is a contract between teams', `Welcome to the design tokens lesson. We will review four questions: raw values and token layers, renaming a public token, dark mode and forced colors, and controls that break when text grows. Before looking at those defects, we need to understand what tokens promise. A token is a named design decision that can be reused by code and design tools. Its value might be a color, a distance, a font size, or a duration. A useful name explains the role of that decision rather than its current appearance.

The consumer of a shared library should be able to change a supported theme without copying a component's stylesheet. If every component chooses its own blue, radius, and spacing, a brand refresh becomes a search through unrelated code. More subtly, a dark theme can change a background without changing its foreground. The result can be technically consistent with the old stylesheet and still unreadable. Tokens let us express related decisions together and review them as a system.

In an interview, do not stop at replacing hexadecimal values with variables. Explain the source of truth, the token layers, the override boundary, and how you test the result. A senior answer also considers existing consumers. A public CSS custom property is an interface even though TypeScript cannot see it. Its name, meaning, inheritance, and fallback behavior can all become dependencies for another team.`],
      ['Primitive, semantic, and component layers', `Primitive tokens describe a palette or scale: a blue step, a spacing increment, or a radius. They are reusable ingredients. Semantic tokens describe intent: action background, content on an action, surface border, or disabled foreground. Components consume semantic roles so they do not need to know which palette step implements a role in each theme.

A component token is justified when consumers need a documented component-specific override that should not affect every use of the semantic role. A button's corner shape might be one such decision. Creating a token for every declaration is usually counterproductive. It exposes implementation details and makes future refactoring expensive. Start with reusable semantic decisions, then add component tokens when a real supported customization requires them.

The example separates a palette value from its purpose. In dark mode, the semantic role can point to another primitive while the component still consumes the same name. Define foreground and background roles as a pair and verify their contrast for every relevant state. A hover role, selected role, and focus indicator need deliberate design; deriving all of them with opacity can fail against a different background.`, `:root {
  --ui-blue-600: #2457c5;
  --ui-color-action: var(--ui-blue-600);
  --ui-color-on-action: #fff;
}
.ui-button {
  background: var(--ui-button-bg, var(--ui-color-action));
  color: var(--ui-color-on-action);
}`, 'css'],
      ['Inheritance and override placement', `CSS custom properties participate in the cascade and ordinarily inherit. A product can set a token on a theme container and descendants can consume the inherited value. This is an important part of a scoped theme: two regions on one page can use different semantic mappings without a global JavaScript toggle.

Be careful where you declare defaults. If a component declares its public override property directly on its host, that declaration wins over an inherited value on an ancestor. The consumer may have set the documented property correctly and still see no change. Prefer consuming a public property with a fallback to the library's semantic role. The fallback supplies a default when the consumer did not provide a value; it does not need to overwrite the consumer's inherited decision.

Debug this in the browser's computed styles. Check the property on the theme ancestor and on the component host, then inspect the actual background declaration. A variable's existence does not prove the component reads it. Also remember that a fallback handles a missing variable; a present value that is invalid for the consuming property can invalidate that declaration at computed-value time. Document the expected value type and test representative overrides.`],
      ['Renaming a token without losing overrides', `Renaming a public token is a migration. During the compatibility period, the new name should win when supplied, the old name should still work when the new one is absent, and the library default should remain last. Put that order in the consuming declaration. Avoid defining an alias so eagerly that the old value can no longer reach the fallback.

Test the four consumer cases: neither name, old name only, new name only, and both names. Include inherited values on a container because testing only direct host styles can hide the cascade bug. Publish the replacement, removal version, and migration examples. A token contract also includes units and meaning. Renaming a fixed height to a minimum height may improve accessibility but can change layout, so teams need to review it.

The eventual removal belongs in a release that follows your compatibility policy. Forty teams will not all migrate on the same day. Agree on a support window, supply automated help where possible, and collect evidence of remaining uses. Do not remove an override merely because the library itself no longer uses the old name. The consumer is the reason the compatibility alias exists.`, `.ui-button {
  background: var(--ui-button-background,
    var(--ui-button-bg, var(--ui-color-action)));
}
/* New name, then deprecated name, then default. */`, 'css'],
      ['System themes and application preferences', `A theme library should not assume that every application starts in a browser or stores a preference in local storage. Server rendering, hydration, embedded applications, and scoped themes have different requirements. Let CSS handle a system color preference where possible. An explicit application choice can set a dedicated attribute without replacing unrelated classes.

The light-dark function selects a value according to the used color scheme. A root that supports light and dark can follow the system preference, while a scoped explicit scheme can choose one. For older supported browsers, provide light defaults and a prefers-color-scheme media query, then explicit theme overrides. Check the actual browser support policy before selecting the implementation; the function is a capability, not a universal assumption.

A stored explicit choice needs to be restored before first paint if the application wants to avoid a flash. A library can document how the application sets an attribute during server rendering or initial page setup. It should not silently choose a storage policy or overwrite body classes. When JavaScript is needed, inject the document and guard browser-only APIs; a framework service must still respect the execution environment.`],
      ['Forced colors and non-color state', `Forced-colors mode changes the rules. The browser can replace author colors with system colors chosen by the user. A selected chip that differs only by a blue background may become indistinguishable from an unselected chip. Communicate selection with an additional cue such as a check mark, border, or text, and expose the same state through the appropriate ARIA attribute.

Use system colors deliberately where a custom indicator needs them. Highlight and HighlightText form a system-selected pair; GrayText can express disabled text. Avoid turning off forced color adjustment for a whole component simply to preserve a brand palette. A narrowly justified adjustment must still use colors that respect the user's mode and retain a visible focus indicator.

Browser emulation in CI can check that outlines, selected markers, and disabled states remain rendered. Automated checks are valuable, but they do not replace testing on an actual high contrast configuration with assistive technology. Treat a forced-colors screenshot as evidence of the tested browser state, not a certification of every platform. This distinction will matter when we discuss verification.`],
      ['Text growth, reflow, and target size', `Relative font units help controls follow the user's preferred default text size. A rem is relative to the root font size. Avoid setting a fixed root size that defeats that preference. Browser zoom and an increased default font size are different mechanisms, so test both. A pixel border can be reasonable even when the text is relative; the goal is usable scaling rather than replacing every unit mechanically.

Fixed heights, hidden overflow, and non-wrapping labels are a dangerous combination. Use minimum sizes with padding and allow the control to grow. Check long translations, two hundred percent text scaling, and the WCAG text-spacing adjustments: line height of one and a half, paragraph spacing of twice the font size, letter spacing of point one two em, and word spacing of point one six em. No text or essential operation should disappear when those values are applied.

Separate icon size from hit target size. A small icon can sit in a much larger native button. WCAG's minimum target criterion is twenty-four CSS pixels with defined exceptions; many systems choose larger touch targets. A dense layout requires checking spacing and exception conditions, not simply claiming that twenty-four-pixel rows make every target compliant. Verify the actual clickable rectangle and neighboring targets.`, `.ui-icon-button {
  min-inline-size: 2.75rem;
  min-block-size: 2.75rem;
  padding: .5rem;
  font-size: .875rem;
  line-height: 1.5;
}
/* The icon can be smaller than its button. */`, 'css'],
      ['A repeatable review and verification method', `Review tokens from the consumer outward. Identify the supported override, follow its fallback chain, then examine every visual state that consumes it. Include light, dark, explicit preferences, inherited scoped overrides, forced colors, disabled states, focus, enlarged text, and long labels. This matrix turns vague reports such as the theme does not work into reproducible cases.

Centralize authoring where designers and engineers can review the same decisions, and generate platform artifacts rather than manually synchronizing values. The generated CSS, native platform constants, documentation, and previews should preserve semantic names. Validate references and types so a missing alias or mismatched unit fails before publication. A lint rule can prevent new raw values in component styles while allowing the intentional palette source.

As we read the questions, connect every proposed correction to a failure mechanism and a regression test. Explain who owns an override and what existing consumers will observe. That combination demonstrates senior judgment: the design is coherent, the implementation respects CSS behavior, and the rollout protects teams who depend on it.`],
    ],
  },
  accessibility: {
    title: 'Accessible Angular Components: Names, Focus, and Interaction',
    goals: 'Build named keyboard-operable controls, dialogs, tabs, form fields, notifications, and a single-select listbox with explicit focus and selection behavior.',
    foundations: [
      ['Accessibility is observable behavior', `Welcome to the accessibility lesson. We will examine an icon button, a modal dialog, tabs, a form field, toast announcements, and a complete listbox coding exercise. Accessibility is part of a component's behavior and public contract. A control must have a discoverable role, a meaningful name, appropriate states, and an interaction model that works without a pointer.

A screenshot cannot tell you whether pressing Tab reaches the control, whether the focused item is selected, or whether an error is connected to its input. A component can look correct while its accessibility tree tells a different story. Start a review by inspecting the native element, then its computed role and accessible name, then its states and relationships. Finally use the keyboard to operate it in the order a user would.

Our examples are teaching implementations. We will verify DOM relationships, keyboard events, native dialog behavior, and focus in a real browser. We will not treat those checks as proof of every screen reader's announcements. Speech output depends on browser and assistive technology combinations. A senior answer states which behavior was tested and where manual testing is still needed.`],
      ['Choose native semantics before adding ARIA', `A native button already supports keyboard activation, focus, disabled behavior, and a button role. A clickable div has none of those properties automatically. Adding role button only changes its semantic description; it does not make Space activate it, put it in the tab order, or prevent activation while disabled. Prefer the native element when it provides the required behavior.

ARIA supplements semantics when a native element does not express the complete widget. It describes roles, states, and relationships. The application remains responsible for keeping those states synchronized with behavior. A tab marked selected must show the corresponding panel. An option marked disabled must not become selectable through a separate click handler. An aria-modal attribute does not itself make the background inert.

Use the WAI-ARIA Authoring Practices patterns as an interaction reference for composite widgets. They provide expected keyboard behavior and explain focus strategies. They are guidance rather than a blanket compliance certificate. Select the pattern that fits the user task, then implement the whole model. A row of buttons is not automatically a tablist, and a list of links may be better navigation than a custom listbox.`],
      ['Accessible names and descriptions', `An accessible name identifies a control. For a visible text button, its content often supplies that name. An icon-only button needs another naming source, such as aria-label or aria-labelledby. Hide decorative icon markup from assistive technology so an SVG title or glyph does not compete with the intended label. The label should describe the action, such as Delete invoice, rather than the image, such as Trash can.

An accessible description provides supporting information. Connect instructions, constraints, and errors with aria-describedby rather than replacing the name. A tooltip is not a reliable substitute for a required name. Keyboard users must be able to reveal and dismiss supplemental tooltip content, and the button should already make sense before the tooltip appears.

Prefer aria-labelledby when visible text already provides the right wording, particularly when several labels contribute useful context. Ensure every referenced identifier exists and is unique. Generated identifiers must work across multiple instances. Module counters are convenient in simple browser examples, but server rendering and hydration require a stable strategy so the client does not produce different relationships from the server.`, `<button type="button" aria-label="Delete invoice">
  <svg aria-hidden="true" focusable="false"></svg>
</button>
<label for="email">Email</label>
<input id="email" aria-describedby="email-help">
<p id="email-help">Use your work address.</p>`, 'html'],
      ['Focus is a resource with an owner', `Focus tells the keyboard user where the next operation will happen. Keep a visible focus indicator, avoid unnecessary positive tabindex values, and preserve a logical reading order. When a component moves focus, it should have a clear user-facing reason. Opening a modal is one such reason; receiving a background toast normally is not.

Before opening a modal, remember the invoking element. On open, focus an appropriate element inside the dialog. Contain interaction while it is modal and provide a keyboard dismissal path. On close, restore focus when the invoking element still exists and is usable. If a destructive action removed it, choose a logical next location rather than focusing a detached node. This fallback is a production design responsibility.

Initial focus depends on content and risk. A destructive confirmation commonly starts on the safe action. A long structured explanation can start at a heading or paragraph with tabindex minus one so users can read it before acting. Do not focus the entire dialog element merely because it is easy to query. Native dialog and the CDK reduce the amount of custom behavior, but they still need a name and a deliberate focus policy.`],
      ['Modal dialogs and content creation', `Use showModal on a native dialog when its behavior fits. It places the dialog in the top layer and makes the rest of the document inert. Merely setting the open attribute creates an open dialog without the same modal operation. The distinction explains why visually covering a page does not prevent keyboard interaction with controls underneath.

Keep the Angular state and the native dialog state connected. Escape produces a cancel event. A form with method dialog can close the element through another path. Route those paths back to the component's model, and restore focus after closure. Invoke browser DOM operations after rendering, not during a constructor before the view query exists.

Projection is another source of surprises. A parent creates its projected content even if the child's ng-content appears inside a condition. Hiding a dialog does not prevent an expensive projected form from being created or making requests. Offer a template slot that is instantiated only when open, or a dialog service that creates a component on demand. This separates visibility from lifetime.`, `const dialog = document.querySelector('dialog');
// Browser-only teaching excerpt:
dialog?.showModal();
// Setting the open attribute is not equivalent.
// Heavy content can be created from a template on demand.`, 'ts'],
      ['Composite widgets and keyboard tables', `A composite widget groups several related items into a coherent keyboard interaction. A tablist generally has one tab in the page's tab order. Arrow keys move within it, Home and End reach the extremes, and selection determines which panel is shown. Keep roles, aria-selected, tabindex, aria-controls, and panel labeling consistent.

Automatic activation selects a tab as focus moves. It works well when panels display immediately. Manual activation moves focus first and selects on Enter or Space, which can avoid repeated slow requests. Do not combine half of each model. If scrolling buttons are added for narrow screens, preserve keyboard access to the actual tabs and scroll the focused tab into view. The extra buttons should not replace the tablist semantics.

Track identity rather than assuming a static index is always enough. Removing the final tab must not leave an inaccessible panel or no reachable tab. Handle empty lists, disabled items if supported, right-to-left direction, and multiple groups. A key manager can help with traversal and wrapping, but it does not supply the entire semantic and selection contract.`],
      ['Form relationships and error timing', `A visible label needs a programmatic connection to the input. Match label for with input id, or use valid wrapping label semantics. A custom component wrapper cannot rely on an identifier on its host automatically naming an internal input. Form-field abstractions need an explicit relationship to the actual control.

Use aria-describedby for helper and error text and aria-invalid when the control is invalid according to the application's display policy. Do not announce every validation detail before the user has had a chance to enter data. An error shown after blur or submission usually needs a clear explanation and a route to correction. Preserve instructions when adding an error rather than dropping their identifier accidentally.

For live error updates, establish the live region before putting the message into it. Some assistive technology misses a region inserted together with its first text. Keep the name, description, visual error, and live announcement synchronized, but avoid redundant repeated speech. Verify the structural relationships automatically and test actual announcements manually on supported combinations.`],
      ['Live regions are asynchronous communication', `A toast's presence on screen does not mean a screen reader will announce it. A persistent live region provides a communication channel. Polite announcements usually wait for an appropriate pause; assertive announcements may interrupt. Choose urgency according to the user impact, not the color of the toast. Routine success feedback should rarely interrupt what the user is reading.

Separate the visible notification history from the announcement channel. Replacing a list of toasts can cause too much content to be spoken or can repeat old messages. Publish the specific new status through a live announcer or persistent region while leaving the visible items available for review. Do not move focus into a noninteractive toast simply to make it noticeable.

Rapid changes can be coalesced or interrupted depending on the platform. A sequence such as three files uploaded, then four files uploaded, is not a reliable promise of two separate spoken sentences. Batch progress, announce a final summary, and offer stable visible status. Tests can verify that the intended text reaches a connected live region; they cannot assert a universal spoken transcript from a DOM change.`],
      ['Listbox focus and selection are different', `A single-select listbox lets a user choose one option. The active option is the one keyboard navigation currently addresses. The selected value is the committed choice. These can differ when arrows move without selecting. Pick a documented behavior and keep it consistent for pointer and keyboard interaction. A native select is often preferable when it fits the product need.

With aria-activedescendant, DOM focus stays on the listbox container. The attribute points to the rendered active option, which must exist and have an identifier. Roving tabindex is an alternative for a standalone widget: focus moves among option elements. Do not mix both strategies casually. Neither strategy removes the need to scroll the active option into view and display a visible indicator.

Use roles listbox and option, an accessible name on the container, aria-selected on options, and aria-disabled where appropriate. Disabled options remain discoverable but must not be chosen. Keep identifiers unique across instances. In an empty or all-disabled list, remove an invalid active descendant reference and let navigation safely do nothing.`, `<ul role="listbox" tabindex="0"
    aria-label="Country"
    aria-activedescendant="country-ca">
  <li role="option" id="country-ca"
      aria-selected="true">Canada</li>
  <li role="option" id="country-us"
      aria-selected="false">United States</li>
</ul>`, 'html'],
      ['Listbox state, typeahead, and dynamic data', `The coding exercise uses a model for the selected value and a linked signal for the active index. When options change, reconcile the active item against current data instead of keeping an index that can point past the list. Object values may need compareWith because a refetch can return equal records with different references. Do not mutate the consumer's options to store local selection.

Arrow keys, Home, and End traverse enabled options; Enter and Space commit the active item in this example. Prevent the browser's scrolling default for handled navigation keys. Printable characters build a short typeahead buffer, with a reset timer and modifier-key filtering. Clear the timer on destruction. Repeated-letter cycling deserves special attention: a buffer that becomes two identical letters does not automatically implement cycling. We will document that limitation in the source example and show a correction.

Virtualization adds an important constraint. An active descendant cannot safely reference an option removed from the DOM. A large list needs an identity and rendering strategy that keeps the active option represented, correct position and set-size metadata where required, and integration tests. Do not add virtual scrolling to a semantic listbox and assume the accessibility contract survives unchanged.`],
      ['Style from state and verify transitions', `Selection should remain recognizable without color. A check mark or another shape can supplement background and weight. Style from ARIA state where it reflects the actual behavioral state, so a separate CSS flag cannot drift. Use design tokens for focus rings, surfaces, spacing, and disabled colors, with forced-colors adjustments where necessary.

Build tests around transitions: focus enters, arrows move, selection commits, options change, a disabled item is skipped, and focus returns after dismissal. Render two instances to catch duplicate identifiers. Test empty and all-disabled data. For dialogs, use real Tab and Escape events in browser automation because synthetic dispatch alone does not perform the browser's default focus behavior.

An automated accessibility scanner catches many missing names and invalid relationships, but it does not prove the widget's full interaction pattern. A test can pass every scanner rule and still fail to move focus with ArrowRight. Combine structural checks, behavior tests, visual review, and manual assistive-technology checks. We will use this layered method in every walkthrough.`],
    ],
  },
  'component-api': {
    title: 'Angular Component APIs: Native Semantics and Consumer Contracts',
    goals: 'Design predictable inputs and events, preserve native element capabilities, use composition, and implement the forms control contract.',
    foundations: [
      ['Design from consumer tasks', `Welcome to the component API lesson. Our four questions concern a button that saves twice, an input wrapper that hides native capabilities, a card with too much configuration, and a checkbox that violates the forms contract. They share a root concern: a shared component should make the supported task clear and preserve the behavior consumers reasonably expect.

Begin with a representative consumer template. What does the team bind, which events do they handle, and where does state live? Then examine the actual host element and any internal native element. A label, a disabled attribute, or an identifier on a wrapper does not automatically reach the internal control. An API that appears convenient can force dozens of forwarding inputs as soon as another team needs a native capability.

A senior answer considers the interface as well as individual bugs. Explain the smallest useful contract, show how to use it, identify unsupported combinations, and describe the migration from today's behavior. Compatibility includes native events, form state, projected content, styling hooks, and test APIs, not just exported TypeScript names.`],
      ['Inputs express allowed states', `Use input types that express supported values. A string input for button kind accepts values the stylesheet cannot represent. A union of primary, secondary, and danger tells the compiler and editor what is supported. Defaults should be intentional, and required inputs should be reserved for values without which the component cannot function meaningfully.

Boolean attributes need careful handling. In HTML, disabled with no value expresses presence. A plain string read as an empty value is falsy in JavaScript, which can make an apparently disabled wrapper remain clickable. Angular's booleanAttribute transform gives predictable attribute-style coercion. Explain which values it accepts and test both static attributes and bound booleans.

Inputs are data coming from the consumer. Avoid silently copying them into an unrelated local field that only initializes once. If the value is derived, use a derivation. If the child commits local state, a model can express a two-way contract. If the parent must approve a proposed change, keep a controlled input and emit a request rather than committing first. The signals lesson develops that distinction in depth.`, `type ButtonKind = 'primary' | 'secondary' | 'danger';
readonly kind = input<ButtonKind>('primary');
readonly disabled = input(false, { transform: booleanAttribute });
readonly type = input<'button' | 'submit' | 'reset'>('button');
// Teaching excerpt; imports are in the complete example.`, 'ts'],
      ['Native events and component outputs', `A native click bubbles from an internal button through the component host. If a component also emits an output called click, a consumer can receive an unexpected second notification. Before inventing an event, ask whether the native event already expresses the action. Ordinary button activation usually needs no custom click output.

Reserve component outputs for domain transitions that are not already represented by native events. A selected value change or a dismissal request can be useful. Avoid names that collide with native events such as input, change, focus, blur, or keydown unless the component intentionally documents that contract and its interaction with bubbling. A lint rule can enforce the library's event naming policy.

Do not distinguish keyboard and pointer activation by guessing from an event detail without considering assistive technology. Consumers may legitimately need a native MouseEvent or KeyboardEvent for specialized behavior, but business logic should ordinarily respond to activation independently of the device. Keep telemetry requirements separate from whether the action succeeds. Test one activation produces one consumer action, and test disabled behavior through the real native control.`],
      ['The native host can be the API', `An attribute directive on a native input can style and enhance it while retaining autocomplete, inputmode, maxlength, name, id, validation, browser autofill, labels, and forms integration. Consumers do not need a wrapper to forward every property. A component with an attribute selector can also enhance a native element when a template is needed.

A wrapper can still be appropriate for a genuinely composite control, an overlay-based picker, or a widget whose focusable element needs coordinated internal structure. The trade-off should be explicit. If the wrapper hides the native element, it needs a clear forwarding and focus contract. A request for twenty-three new inputs often signals that the abstraction boundary is in the wrong place rather than that twenty-three more inputs are needed.

Shared behavior can be factored through directives and the directive composition API. Inputs and outputs from host directives are exposed explicitly, and composition is established statically. This helps reuse focus or disabled logic, but it cannot automatically forward every arbitrary native attribute into a hidden descendant. Choose the host element first, then use composition to share behavior at that boundary.`, `<label for="email">Email</label>
<input uiInput id="email" type="email"
       autocomplete="email" inputmode="email"
       maxlength="120" [formControl]="email">
<!-- Native capabilities remain on the actual input. -->`, 'html'],
      ['Composition for rich content', `A card with separate inputs for every badge, action, heading, image, and body style accumulates combinations the library must maintain. Content projection lets consumers supply real HTML and application components within documented slots. The library owns layout and style while the application owns content, heading level, links, and business actions.

Projection preserves Angular bindings and native semantics better than passing an HTML string. Angular sanitization helps protect unsafe bindings, but sanitization does not turn arbitrary innerHTML into a well-designed content API. A body string cannot conveniently carry application directives or typed interactions. Make image alternatives and headings explicit consumer responsibilities when the content is projected.

Configuration remains valuable for uniform repeated data. A table's column definitions are naturally data driven, and a menu can often be generated from a typed item model. Offer template customization at the points where the structure truly varies. Avoid replacing every configuration object with dozens of unstructured slots; explain the consistency versus flexibility trade-off.`],
      ['Forms have two data directions', `A ControlValueAccessor adapts a custom control to Angular Forms. The forms model calls writeValue to update the view. The component calls the registered onChange callback after a user change to update the forms model. These are opposite directions. Calling onChange from writeValue creates a feedback path and can mark a programmatic reset as a user edit.

The registered onTouched callback reports the appropriate touch interaction, commonly blur for a single input. The disabled-state hook must update the actual interactive element. Signals or markForCheck make model-to-view updates observable under OnPush and zoneless change detection. Normalize null when reset can supply it, and document whether a checkbox supports an indeterminate state separately from its value.

Test through a real FormControl host. A programmatic value write should update the view while the form stays pristine. A user change should update the value and dirty state. Blur should make it touched. Disabling the control should prevent user interaction. These tests verify the contract; a test that only invokes toggle on the component misses the connection to the forms engine.`, `writeValue(value: boolean | null): void {
  this.checked.set(value ?? false);
}
registerOnChange(fn: (value: boolean) => void): void {
  this.onChange = fn;
}
// User path only:
onUserChange(value: boolean): void {
  this.checked.set(value);
  this.onChange(value);
}`, 'ts'],
      ['Signal forms are a separate integration contract', `Reactive forms use ControlValueAccessor. Signal-based forms have their own custom-control interfaces and bindings. Do not assume that a value accessor automatically implements every signal-forms capability. Check the API for the supported Angular version and choose the integration explicitly.

For a value control, the signal-forms interface exposes a writable model value with supported state inputs. Checkbox-like controls use the corresponding checked control contract. The form field binding coordinates the form model with that control. Disabled, readonly, touched, validation, and accessibility state need to remain coherent. If the library supports both forms systems, document and test each integration rather than forcing them to write the same state through two competing paths.

Version support matters because these interfaces can differ across Angular releases. Our complete examples use the installed framework version. A library claiming support for older majors must test its public interfaces against those majors. This is a compatibility claim, not something a successful build on one version can prove.`],
      ['Migrate with examples and compatibility tests', `Removing an output can change what an existing consumer receives. Adding a union can reject values that compiled yesterday. Moving a wrapper to a native attribute selector changes the template. These improvements need a release and migration strategy. Inventory current usage, publish the preferred API, retain compatibility where practical, and give teams a clear removal window.

Document the consumer-facing form in examples that compile. Show native events, labels, forms binding, projected slots, and disabled behavior. A component harness should expose meaningful tasks instead of internal classes so a markup refactor does not break every product's tests. Treat that harness as a supported API with its own compatibility obligations.

During the questions, trace a reported bug from the consumer template to the actual element or callback. Identify whether the problem is coercion, event duplication, hidden capabilities, excessive configuration, or reversed data flow. Then propose a correction and a test that would have failed before it. This makes the answer reviewable rather than a list of preferred patterns.`],
    ],
  },
  versioning: {
    title: 'Versioning Angular Libraries: Compatibility and Safe Migration',
    goals: 'Classify breaking changes, implement input deprecation, control package exports and peer dependencies, and plan consumer migrations.',
    foundations: [
      ['Define the public contract before choosing a version', `Welcome to the versioning lesson. We will classify twelve proposed changes, review an input deprecation, and repair a package that leaks internals and duplicates Angular. Semantic versioning becomes useful only when the package defines what its public contract includes. For a component library, that contract extends beyond method signatures.

Inputs, outputs, selectors, tokens, documented DOM hooks, keyboard behavior, forms integration, defaults, peer ranges, and testing harnesses can all affect consumers. An accidental export can become an external dependency even if its author intended it to be private. A private intention does not remove a name from the package that was actually published.

Ask whether a supported consumer that worked before can continue to work without modification. Then distinguish an intentional public promise from an unsupported dependency and consider the practical rollout. A change can be formally compatible and still deserve a visual review. A change can fix a bug and still break a workaround. State the compatibility policy instead of assuming that the word fix determines the release number.`],
      ['Input acceptance and output obligations', `An input accepts values from consumers. Widening its accepted type usually permits more existing uses without invalidating them. Narrowing it can make an existing template stop compiling. A new required input forces consumers to provide information they did not previously need. An optional input with a harmless default is generally additive.

An output is different. Consumers handle the values the library emits. Widening an output to include null can break a handler that dereferences the original non-null value. The library has increased the obligations of the receiver. Do not classify input and output changes with the same rule merely because both use a union type.

Defaults also carry meaning. Changing medium to small can alter layout in every template that omitted the size. Even if no compile error appears, consumers may rely on the old visual result. Evaluate documented guarantees, snapshots, and product impact. A complete interview answer says which changes are clearly breaking and which depend on the contract, then explains the evidence that resolves each uncertain case.`, `// Input: accept more values.
readonly value = input<SelectOption | null>();
// Output: consumers must now handle null.
readonly selectionChange = output<SelectOption | null>();
// These changes have different compatibility consequences.`, 'ts'],
      ['Behavior and presentation can break consumers', `Switching to OnPush can expose consumers that mutate an object in place or dynamically insert a child that relies on zone-triggered checks. A keyboard change can improve conformance while changing how existing interactions behave. Internal DOM changes may be safe under a documented encapsulation policy, but tests, selectors, and custom styles can still depend on them in practice.

Build an inventory of supported customization points. If teams were instructed to use an internal class, it is not really internal. If the harness supplies the supported interaction API, update the harness with the component. Theme tokens need contrast and visual checks; a darker color is not automatically a breaking change or automatically harmless.

Raise a minimum Angular peer version only when dropping support is intentional and tested. A package that claims compatibility with a range should install and compile representative consumers across that range, including its forms and testing entry points. Passing on the newest framework alone does not validate the minimum.`],
      ['Deprecation preserves behavior while changing guidance', `A deprecation introduces a supported replacement while keeping the old contract usable for an announced period. In the button rename, both inputs need an unset state so resolution can distinguish absence from an explicitly selected primary value. The new input wins, then the old input, then the default.

Warnings should be actionable and limited to actual deprecated usage in development. A computed derivation should stay pure. Put the diagnostic side effect in an appropriate effect and choose whether once means once per instance or once per application. Document that choice. Do not teach teams to ignore a flood of warnings from components that already use the new name.

Compatibility also includes direct component references. If callers read the old input getter, changing its default from primary to undefined is observable even when the rendered appearance is unchanged. State that limitation and inventory such uses. For strict compatibility, consider a distinct resolved property or a bridging API. A visual equivalence claim should not erase a public property change.`, `readonly kind = input<ButtonVariant>();
readonly variant = input<ButtonVariant>();
readonly resolvedVariant = computed(() =>
  this.variant() ?? this.kind() ?? 'primary'
);
// New name wins; explicit old default is still detectable.`, 'ts'],
      ['Migrations need more than a search and replace', `A template migration can rename a static kind attribute and a bound kind input when it knows the element is the library component. It should not rewrite every unrelated kind attribute in the repository. Parse templates and resolve symbols where the tooling supports it, then report uncertain cases rather than applying a destructive guess.

Programmatic setInput calls, host directive aliases, dynamic templates, and computed property names need separate analysis. A migration can handle statically resolvable string names and known imports, while emitting a report for dynamic uses. Make migrations repeatable and test both changed and unchanged files. The report should explain the manual correction and replacement API.

Publish a changelog, replacement examples, editor deprecation hints, and a removal version. Gather data from repository scans, CI builds, and consumer owners before removing the old contract. Runtime diagnostics can help during development, but avoid secretly transmitting consumer code or telemetry. Migration evidence should be explicit and proportionate to the organization.`],
      ['Package boundaries and peer dependencies', `Angular libraries should cooperate with the application's Angular installation. Declaring Angular framework packages as ordinary runtime dependencies can allow multiple incompatible copies. That can lead to injection context and identity problems, although a specific NG0203 error still needs diagnosis rather than a one-cause assumption. Peer dependencies express the versions the consumer must supply.

Use explicit exports to keep the public surface deliberate. A wildcard export can publish internal helpers and component rows accidentally. Separate entry points let consumers import the feature they need, and a testing entry point can expose harnesses without making them part of the main application API. However, an entry point alone does not make a dependency optional at installation time.

If a date picker depends on a date library, simply moving it to a secondary entry point may improve imports and bundles but still leave a required root dependency. Making an optional peer safe requires isolating references and documenting the feature's requirement, or using a separate package. Evaluate package manager installation, TypeScript resolution, and bundling separately. They are different phases with different failure modes.`],
      ['Release gates and support policy', `A release gate can compare public declarations, compile representative templates, run behavior and accessibility tests, inspect the packed artifact, and review theme snapshots. A generated API diff is useful, but it cannot understand every default or keyboard change. Combine mechanical checks with a release checklist that asks whether consumer behavior changed.

Decide how many major lines to support according to staffing and consumer upgrade schedules. Support should state security patches, critical fixes, supported framework ranges, and the end date. A breaking security fix may need a new major and compatible backports or a documented mitigation for older lines. Communicate urgency and migration steps; do not silently redefine a minor release as breaking while claiming ordinary semantic versioning.

Before publishing, install the packed package into a clean consumer project. Test each supported entry point without relying on monorepo path mappings. Verify peers, declarations, exports, assets, and dependency isolation. The consumer should receive the package you tested, not an internal build layout that accidentally makes missing files available.`],
    ],
  },
  testing: {
    title: 'Testing Angular Libraries Through Consumer Behavior',
    goals: 'Use consumer hosts, browser interactions, component harnesses, accessibility checks, and focused visual regression coverage.',
    foundations: [
      ['Green tests need meaningful assertions', `Welcome to the testing lesson. The question shows tabs that shipped without keyboard support and with duplicate identifiers even though the tests were green. A passing test is evidence only for the assertion it actually makes. Checking that a select method exists proves the shape of an object. It does not prove a user can select a tab with the keyboard.

A test can even preserve a bug if it expects the wrong result. An assertion that the active class is absent after selection does not validate selection; it blesses that absence. Begin by writing the user-visible contract in plain language. A tab is selected, its panel is visible, focus moves according to the keyboard pattern, and identifiers remain unique across instances.

The testing strategy should reflect how the library is consumed. Product teams bind inputs in templates, project content, handle outputs, and connect forms. A component created alone with direct private method calls does not exercise those boundaries. Use a small host that resembles a real consumer, then interact through the rendered interface and assert observable results.`],
      ['A host exercises Angular integration', `A host template gives Angular the opportunity to bind inputs, create projected children, connect models, and resolve parent-provided injection contexts. This matters for tabs because the group discovers projected tab components. Calling a method on an isolated group cannot prove that discovery or its panel relationships work.

Render more than one instance. Duplicate identifiers are often invisible in a single fixture. A second group also catches selectors that accidentally operate on the entire document instead of the current component. Give the groups different names and labels so a test can locate the intended instance without relying on position.

Change consumer inputs after the initial render. A component may initialize correctly and then ignore a reset or a new set of children. Test removal, empty content, and valid dynamic changes if they are supported. This shifts the test from a constructor snapshot to the contract over time. A shared component lives inside an application that changes.`, `<ui-tabs label="Profile">
  <ui-tab label="Account">Account settings</ui-tab>
  <ui-tab label="Security">Security settings</ui-tab>
</ui-tabs>
<ui-tabs label="Notifications">
  <ui-tab label="Email">Email settings</ui-tab>
</ui-tabs>`, 'html'],
      ['Interactions should exercise the event path', `Directly calling select skips the event binding, key handling, default prevention, focus movement, and disabled checks. For a click contract, click the real control. For a keyboard contract, focus the relevant element and send the actual key in a browser test. Synthetic dispatch can exercise a handler, but it does not reproduce browser default actions such as Tab traversal.

Write assertions from the chosen interaction table. In automatic tabs, ArrowRight moves focus and selection, wrapping at the final tab. Home and End reach the edges. Exactly one tab should be in the tab order, and its selected panel should be visible. Manual activation has a different table, so the test must not assume both patterns simultaneously.

Use roles, accessible names, and supported harness methods to locate behavior. A private class used for styling is a fragile consumer test selector. The library may use internal selectors inside its harness because it owns both, but product tests should not need to know them. Test the result rather than the implementation detail that happened to create it.`],
      ['Harnesses are versioned testing interfaces', `A component harness exposes meaningful operations such as selectTab and getSelectedTabLabel. It encapsulates queries, interactions, and stabilization. A filter can choose a group by its public label. This creates a boundary between product tests and component internals.

Expose the capabilities a consumer needs to verify a task. Do not return internal DOM nodes, private fields, or CSS class names merely to make the current test easy. Those leaks defeat the abstraction. Errors should explain when a requested tab does not exist rather than silently selecting an arbitrary fallback.

Publish harnesses through a testing entry point and document supported environments. Keep the harness and component versions compatible. If a component's markup changes, the harness implementation can adapt while its task API stays stable. A harness API change itself can break consumer tests, so review and version it with the same care as an input or output.`, `const tabs = await loader.getHarness(
  TabsHarness.with({ label: 'Profile' })
);
await tabs.selectTab('Security');
expect(await tabs.getSelectedTabLabel()).toBe('Security');
// Consumer task, not a private class selector.`, 'ts'],
      ['Stabilization must not hide rendering bugs', `Angular tests can force a render with detectChanges. That is useful for many assertions, but it can mask a missing change-detection notification. A promise callback that writes a plain field may appear correct when the test manually runs change detection even though the application would not render it.

For notification-sensitive behavior, use a zoneless fixture and wait for stability without forcing every update. A signal consumed in the template, setInput, or markForCheck should notify Angular. Test an asynchronous completion and a timer reset through the same path the component uses. This verifies scheduling as well as the final value.

Control time where the behavior depends on a deadline. Fake timers or an injected scheduler can make a debounce or timeout deterministic. But do not replace the event or scheduling mechanism that is the subject of the test. Keep at least one browser integration case for layout, focus, and native behavior that an emulated DOM cannot represent accurately.`],
      ['Accessibility automation and its limits', `An accessibility scanner can detect missing names, invalid ARIA relationships, and many contrast failures in a rendered browser. Run it on relevant component states: initial, selected, invalid, expanded, and disabled where those states change the tree. A single empty fixture tells you little about a composite control.

Keyboard and focus need explicit behavior tests. A scanner can accept a tablist whose ArrowRight handler does nothing. Live regions need a different kind of evidence: verify that a persistent connected region receives the intended message with the chosen politeness, then manually check supported screen reader combinations. Do not claim a DOM assertion proves that a user heard the exact sentence.

Combine tests rather than letting one category stand in for all others. Compiler checks prove types and templates. Browser tests prove the exercised behavior. Visual checks prove the reviewed appearance. Manual assistive-technology testing covers interaction and announcements that automation cannot fully certify. Record those boundaries in the release evidence.`],
      ['Make visual regression coverage intentional', `A large screenshot suite can be noisy when every story is captured in every theme at every viewport. Start by mapping the behaviors each image protects. Keep representative states, themes, density variants, and text-growth cases. Remove redundant captures only after confirming their risk is covered elsewhere.

Control the environment: fonts, viewport, locale, animation, loading data, and time. Wait for a meaningful ready state rather than an arbitrary long sleep. Diagnose flakes by category. A random data value is different from a late web font, and a layout race is different from antialiasing noise. Fix the cause before loosening comparison thresholds.

Visual tests need reviewable baselines. A baseline update should identify the intended change and the affected states. Do not approve thousands of images blindly or turn off failures globally. Use focused diffs, ownership, and deterministic fixtures so the suite remains a useful signal rather than a recurring cost everyone learns to ignore.`],
      ['Prove the regression test detects the defect', `When fixing a bug, make sure the new test fails against the old behavior for the intended reason. If the original tabs lack a keyboard handler, an ArrowRight test should fail because focus and selection do not change, not because the fixture has an unrelated missing import. This is the evidence that the test protects the correction.

Avoid assertions that merely mirror the source. Checking that a function assigns a field is weaker than observing the resulting selected panel and focus. Test the public result with realistic input and multiple instances. Where the contract has boundary cases, include the smallest cases that expose them rather than a huge collection of near-duplicate examples.

In the upcoming question, we will replace method-existence checks with host-based interactions and a supported harness. We will explain what the harness hides, what remains part of its public API, and how accessibility and visual checks complement it. The goal is a test suite that tells the library team whether consumers can still perform their tasks.`],
    ],
  },
  performance: {
    title: 'Angular Performance: Zoneless Rendering and Resource Lifetimes',
    goals: 'Identify render notifications, handle asynchronous state safely, remove zone-dependent DOM timing, and verify cleanup and stable layout.',
    foundations: [
      ['Correct rendering comes before optimization', `Welcome to the performance lesson. The question is a copy button that depends on zone.js, measures its width through a zone event, and resets its status too early after repeated clicks. We will first understand rendering notifications, then fix state, timing, layout, error feedback, and resource cleanup.

Performance is not just making a component execute fewer times. A fast component that fails to show the current state is incorrect. Start by tracing the operation: the click begins a clipboard request, the promise settles, the copied state changes, a timer later resets it, and the view must reflect both transitions. Ask which API tells Angular that each transition needs rendering.

A senior answer connects scheduling to observable behavior. It also questions whether the JavaScript work is needed. Measuring a button can be more complex and less reliable than allowing CSS to reserve space for both labels. Removing an unnecessary layout read improves performance and simplifies correctness at the same time.`],
      ['Zone-based and zoneless change detection', `Zone-based applications use patched asynchronous activity as a broad indication that something may have changed. This can make plain fields appear to update after timers or promises. It is not a universal guarantee: work outside the zone, unpatched APIs, and native asynchronous behavior can still require explicit notification. Avoid teaching that every promise completion automatically fixes every state update.

Zoneless rendering relies on Angular notifications. Signals read by a template notify when they change. Bound template and host listeners, component setInput, markForCheck, and the async pipe are other important paths. A plain field assignment in an arbitrary asynchronous callback is not a notification. Neither is a raw timer merely because it ran.

OnPush is compatible with this model when the component observes its inputs and notifications correctly. It does not make all mutable state observable. Some dynamic-host library components require additional care for children with different assumptions. Test the behavior in a zoneless consumer rather than treating an OnPush annotation as proof of compatibility.`, `readonly copied = signal(false);
async copy(): Promise<void> {
  await navigator.clipboard.writeText(this.text());
  this.copied.set(true);
}
// A template that reads copied() receives a notification.`, 'ts'],
      ['Async boundaries and view notifications', `A click listener can schedule a render before its awaited work finishes. If the handler later writes a plain copied field, that earlier render does not promise another check after the write. An unrelated event may make the label appear, which creates the misleading impression that the code usually works. Tests should isolate the completion and observe whether it schedules its own update.

Use a signal for state consumed by the template or explicitly mark a suitable view for checking. For observable data, the async pipe connects emissions to rendering. For third-party callbacks, adapt data at the boundary instead of requiring product teams to click somewhere else to refresh. NgZone.run is not itself a zoneless notification mechanism, although retaining run and runOutsideAngular can still matter for zone-based consumers.

Server rendering has a related but separate stability contract. Pending asynchronous work that must complete before serialization may need PendingTasks. A render notification tells Angular that a view changed; it does not automatically describe every server-side task. Keep browser clipboard actions out of server execution and document environment-dependent APIs.`],
      ['Use render hooks for DOM timing', `NgZone onStable and related observables do not emit in a zoneless application. They are the wrong boundary for deciding that a view is ready. Use the supported render callbacks when a DOM operation truly depends on the rendered view. afterNextRender handles a one-time operation; a post-render effect can react to dependencies after rendering.

Separate geometry reads from style writes when doing coordinated DOM work. A write followed by a read can force layout repeatedly. Render phases help organize that work, but the best improvement can be removing the measurement entirely. Ask what the measurement is trying to guarantee, whether it survives translation and font loading, and whether CSS already expresses the requirement.

Render callbacks do not execute during server rendering. That is useful for browser-only DOM work, but it also means the initial server output should not depend on a callback that never ran. Give the component a sensible CSS-first state and use browser work as an enhancement where necessary. Test the measured result in a real browser if you make a layout claim.`],
      ['Prefer a layout that handles both labels', `Locking a button to the width of Copy does not stop the longer label Copied from making it grow. Translations can reverse which label is longer, and a loaded font can change both widths. Measuring once before those changes is fragile. Place both labels in the same grid cell so the intrinsic width accommodates the larger one.

Hide the inactive label with visibility hidden. It continues to participate in layout but is removed from normal rendering and the accessibility tree. Display none would remove its contribution to width; opacity zero would leave it in the accessibility tree unless other measures were taken. The choice of hiding mechanism is part of both layout and naming behavior.

Verify the button's bounding rectangle before and after the status change with representative translated labels. Check the accessible name contains the visible label only. This is a concrete example of performance work that removes a layout read, a style mutation, a zone subscription, and timing assumptions while improving the user experience.`, `.labels { display: inline-grid; }
.labels > span { grid-area: 1 / 1; }
.hidden { visibility: hidden; }
/* Both labels size the grid; only one is visible. */`, 'css'],
      ['Timers and promises have resource lifetimes', `Every timer has an owner and an end condition. Starting a new reset timer without cancelling the previous one lets an earlier click reset a later success message. Clear the old timer when beginning the next operation and before installing a new one. Clear it on destruction so callbacks do not update a component that no longer exists.

Promises introduce another edge case. Two clipboard requests can finish out of order. A first request can settle after a second one, creating a stale announcement or another reset timer. A completion can also arrive after destruction. Clearing a timer alone does not cancel an already pending promise. Use a request sequence and a destroyed-state check when the UI must ignore stale completions.

The source correction improves the timer behavior for ordinary sequential completions, but it does not fully guard those overlapping promise cases. We will provide an additional hardened teaching example and verify the sequence guard. State the limitation rather than presenting the minimal correction as a complete concurrency solution.`, `const request = ++this.requestId;
const text = this.text();
await navigator.clipboard.writeText(text);
if (this.destroyed || request !== this.requestId) return;
clearTimeout(this.timer);
this.copied.set(true);
this.timer = setTimeout(() => this.copied.set(false), 2000);`, 'ts'],
      ['Errors and announcements are part of completion', `The clipboard API can reject because permission was denied, the environment is unsupported, or the page is not a secure context. Catch failures and provide useful feedback. Do not show Copied before the operation succeeds. Do not leave a rejected promise unhandled while the UI silently remains unchanged.

A changing button label is not a dependable status announcement for screen readers. A live announcer can communicate success or failure without moving focus. Success is ordinarily polite. An assertive failure announcement should be justified by urgency and interruption cost; it is not automatically required for every rejected clipboard request. Expose translatable messages to the application.

Keep the final state coherent when a later operation fails. Clear or replace stale success, avoid allowing an old completion to overwrite a newer failure, and keep the button operable for retry. Tests should cover success, failure, overlap, reset, and destruction. These are correctness cases that prevent seemingly random performance or rendering reports.`],
      ['Test notifications instead of forcing every render', `A test that manually runs detectChanges after an asynchronous plain-field assignment can hide the production defect. For notification-sensitive cases, use zoneless change detection and wait for the fixture to become stable. Complete a controlled promise, then assert the visible label without forcing a render that Angular did not schedule.

Mock the clipboard boundary so success and failure are deterministic. Control pending requests independently to finish them out of order. Use a short configurable reset delay in the hardened teaching example to verify the timer path without a slow test. Destroy the fixture while a request is pending, then complete it and confirm no new timer or announcement is created.

Real browser tests are necessary for intrinsic layout and accessible names. A DOM emulator cannot prove that the two labels have the same outer button width or that native focus behaves correctly. Compile-time validation remains useful for types, but use the appropriate runtime evidence for every claim.`],
      ['Audit a library systematically', `Search for zone lifecycle subscriptions, plain fields written by timers or promises, direct DOM measurements, subscriptions without cleanup, and effects that allocate resources without an inverse operation. These searches identify candidates; they do not prove that every match is a defect. Review each candidate according to its ownership and notification path.

Run representative consumers without zone.js and interact with components through their actual templates. Include asynchronous data, input changes, multiple instances, and destruction. Add regression tests where behavior fails. A debug check for unnotified binding changes can help find gaps, but do not fix failures by forcing global change detection after every callback.

Profile only after the behavior is correct. Look for repeated expensive derivations, layout thrashing, unnecessary allocations, and excessive renders using measured traces. A signal is not a performance certificate, and a faster benchmark that dropped needed updates is misleading. In the question walkthrough, explain both why the original fails and why the corrected mechanism supplies the missing notification.`],
    ],
  },
};

// Three authored answers per source question, in the source's order.
export const followups = {
  'TOK-001': [
    `Use a versioned token source shared by design and engineering, with typed values, semantic aliases, descriptions, and ownership. Generate CSS custom properties, native platform constants, design-tool artifacts, and documentation from it. Validate alias references and platform transformations in CI. Platforms can use different representations while preserving the same semantic role; do not assume every CSS unit transfers directly to mobile. Review generated changes with design previews so a synchronized value is also an intentional decision.`,
    `Ask whether the request represents a recurring supported role or a one-page exception. A reusable action variant deserves a named semantic contract and state rules. A supported component customization may justify a component token. A purely local art-direction choice can remain an application override without expanding the public API. Check foreground contrast, hover, disabled, and focus states before approving any lighter background. Avoid a variant named only after its current shade because that meaning will not survive another theme.`,
    `Lint component styles to reject raw colors outside the approved primitive token source. Use an allowlist for deliberate values such as transparent and system colors, and require review for exceptions. Validate generated token references, run theme previews and contrast checks, and teach the role-based naming model in contribution guidance. A rule that blindly forbids every hexadecimal value even in the palette source will only encourage suppressions; enforce the actual architecture boundary.`,
  ],
  'TOK-002': [
    `Important changes cascade priority; it does not repair the fallback order or a default declared on the wrong element. Inherited values still do not compete as direct declarations on the child. Escalating specificity makes scoped themes harder to override and creates an arms race between library and product CSS. Keep consumer override properties unset until supplied, consume the new name then the old name, and test the computed result at the component. The fallback is an expression, not a place to insert an important flag.`,
    `Choose a published window long enough for the slowest supported release cadence, with a removal major and named migration owners. For forty teams, collect repository scans, actual theme override uses, CI build results, and completion confirmations. Include applications that upgrade infrequently. Supply a codemod or guidance and track unresolved cases. Time elapsed alone is weak evidence: remove the old token when the policy permits it and consumers have a viable migration path, not merely when the library stopped referring to it.`,
    `Property registration can describe syntax and an initial value, but it cannot fix an incorrect cascade or decide which deprecated name wins. For a token intended to flow from theme containers into descendants, inherits normally needs to be true. A registered initial value can also make a variable present when it used to be missing, changing fallback behavior. Test that interaction before registration. Use registration when its typing or animation behavior is needed, not as a substitute for a compatibility chain.`,
  ],
  'TOK-003': [
    `Check the maintained support tables for the browser versions your applications actually support. The function is available in modern engines, but older supported versions may need light defaults, a prefers-color-scheme media query, and explicit attribute overrides. Use feature detection with supports where appropriate. Keep semantic token names identical across the modern and fallback implementations. The lesson links the support reference instead of freezing a list of browser versions that will become stale.`,
    `Use browser automation to emulate forced colors and inspect selected markers, focus outlines, disabled states, and computed system colors. Capture representative screenshots with stable fonts and data. Assert the selected state is conveyed by a non-color cue and that keyboard focus remains visible. Emulation covers the browser's forced-color mode, not every operating-system palette or screen reader; retain manual checks on supported real configurations and document that limitation.`,
    `Add another semantic mapping rather than duplicating component CSS. Components continue to consume surface, foreground, action, border, and focus roles. Define the high contrast mapping centrally, including interaction states, and verify paired contrast values. Scope the mapping so the application can choose it without replacing unrelated classes. Distinguish an authored high contrast theme from the user's forced-colors mode, which can still override author colors. Test the interaction of both choices.`,
  ],
  'TOK-004': [
    `Spacing can use rem when it should grow with text, such as control padding that protects a larger label. But not every dimension needs the same scaling policy. Borders may stay in pixels, and dense data layouts may use a distinct spacing contract. Explain which values follow font preferences and check that growing padding does not create avoidable overflow. With a larger root font, rem-based text and spacing both grow, so controls need flexible minimum dimensions rather than a fixed height.`,
    `Apply the WCAG text-spacing values to a representative rendered fixture: line height one point five, paragraph spacing two em, letter spacing point one two em, and word spacing point one six em. Verify text remains visible, labels can wrap, operations remain available, and containers do not clip essential content. Inspect geometry and screenshots, including long translations. Do not simply assert a stylesheet contains rem; the criterion concerns the resulting usable page. Combine this with separate text-resize and zoom checks.`,
    `Measure the actual targets and spacing. A twenty-four-pixel row height does not guarantee a twenty-four by twenty-four clickable area. Make the control's target large enough or meet the criterion's specific spacing exception, considering neighboring targets and overlapping hit areas. Keep small visual icons inside larger targets. If the design depends on another exception, document why it applies rather than treating density as an exemption. Test pointer use, keyboard operation, and text growth together.`,
  ],
  'A11Y-001': [
    `A tooltip supplies supplemental explanation; the icon button still needs a name before it appears. Show it on keyboard focus as well as pointer hover, allow Escape to dismiss it, and avoid moving focus into a noninteractive tooltip. Associate useful descriptive content without making the name unexpectedly verbose. Ensure hoverable, dismissible, and persistent behavior where the content criterion applies. If the popup contains interactive controls, it is a different pattern and should not be presented as a simple tooltip.`,
    `Use labelledby when visible text already provides the intended label or when combining a visible action with contextual text is clearer than duplicating a string. It keeps spoken wording aligned with the visible interface and can improve localization maintenance. The referenced elements need stable unique identifiers. Use aria-label for an otherwise unnamed icon control when no suitable visible text exists. Do not add both casually and assume both will be spoken; naming precedence determines the result.`,
    `Run an accessibility scanner in the rendered product and add a browser test that queries buttons by their accessible name. Cover states where icons or labels change and multiple component instances. Required input typing can help library consumers, but an empty string can still pass a string type. Add runtime development diagnostics or tests for empty labels where useful. Automated checks establish that a name exists, not that every name is meaningful, so review representative wording as well.`,
  ],
  'A11Y-002': [
    `Detect a pointer interaction outside the dialog's content rectangle and route it through the component's normal close request. A dialog-target click alone can also occur in content padding, so account for geometry and pointer down/up behavior to avoid accidental closure after dragging. Make backdrop dismissal an explicit policy rather than a universal default. A destructive confirmation or unsaved form may require deliberate cancellation. Keep Escape and a visible close or cancel control available according to the product's requirements.`,
    `Usually focus the least destructive action so an accidental Enter does not commit the destructive operation. If the dialog begins with important structured information, focus a static heading or paragraph with tabindex minus one so the content can be read first. Choose according to the task rather than always focusing the first element in DOM order. Give the dialog a meaningful name and ensure the destructive action is clear. Confirm focus restoration and a sensible fallback if the invoking item is deleted.`,
    `In a real browser, focus the invoking button, open the modal, verify focus enters, and press Tab and Shift Tab to ensure background controls are unreachable. Press Escape and verify the model closes and focus returns. Try programmatically focusing a background control while the modal is open to check native inertness. Cover close-button and form-dialog paths too. DOM attributes alone do not prove native modality; showModal and actual interaction are the behavior under test.`,
  ],
  'A11Y-003': [
    `Use manual activation when showing a panel is slow or costly, such as a network request or heavy render. Arrows move focus, while Enter or Space commits selection. Automatic activation is appropriate when panel changes are immediate and moving through tabs remains responsive. Keep focused and selected indices separate for manual activation and document the keyboard model. Do not change between models unpredictably based on a transient request duration.`,
    `Keep tab roles, selection, panel relationships, and the one-tab-stop strategy intact. Scroll the focused tab into view and make scroll controls named native buttons if they are needed. The extra controls should not cause the arrow handler to treat them as tabs or hide selected tabs from assistive technology. Test touch, keyboard, narrow layouts, and right-to-left direction. A visual overflow solution should preserve the widget's semantic interaction model.`,
    `FocusKeyManager can manage active items, wrapping, orientation, disabled skipping, and typeahead depending on configuration. It can reduce bespoke traversal code. You still own tab semantics, selected state, panels, identifiers, rendering, and automatic versus manual activation. It also introduces an adapter contract and a CDK dependency that must fit the supported framework range. Use it when the shared behavior outweighs that cost, and test the complete component rather than assuming the manager supplies accessibility automatically.`,
  ],
  'A11Y-004': [
    `Assistive technology often observes changes to an already registered live region. If the region and its first message appear in one insertion, some combinations treat it as initial content rather than an update to announce. Keep a persistent empty region, then change its text after the relevant interaction. Timing varies across platforms, so a delayed write is not a universal guarantee. Verify the DOM sequence automatically and test announcements with the supported browser and screen reader combinations.`,
    `Polite is usually appropriate for field validation while the user is entering data. Assertive can interrupt the current speech and should be reserved for genuinely urgent information. Repeated assertive errors on every keystroke can make a form difficult to use. Decide when errors become visible, connect the error as a description, and avoid announcing unchanged messages repeatedly. Submission may need an error summary and deliberate focus management instead of several competing live announcements.`,
    `Prefer a form-field that wraps a projected native input enhanced by a directive, so native attributes stay on the real control. The field and directive can share a control interface through dependency injection and register label, helper, and error identifiers. If an internal input is necessary, document explicit attribute forwarding and a focus API. Do not assume arbitrary attributes on the wrapper automatically reach the descendant. Include autocomplete and forms integration in consumer examples.`,
  ],
  'A11Y-005': [
    `Speech may skip, merge, or interrupt rapid updates; do not promise that both counts are read exactly. Batch progress updates and announce a useful final summary, while keeping current visible status available. A live announcer can replace an outdated progress message rather than queueing every intermediate number. Avoid repeatedly speaking the entire toast history. Test the message sequence and manually evaluate the supported assistive technology to choose a useful cadence.`,
    `A named region can make a persistent notification history discoverable, especially if it contains actions users may revisit. But turning every transient toast into a landmark creates navigation noise. Prefer one meaningful named outlet when it serves a navigable purpose, and use a separate status announcement channel for new messages. Do not move focus to the region merely because a toast appeared. Evaluate the page's existing landmarks and the user's recovery task.`,
    `Automate the structural contract: a persistent connected live region, the intended politeness, and the new message reaching it after the event. Spy on a live announcer at a unit boundary only when testing the call contract; also exercise the browser integration. A DOM test cannot prove the exact spoken output, so include manual screen reader checks for repeated messages, interruption, and timing. Document the tested combinations rather than declaring announcement behavior universally certified.`,
  ],
  'A11Y-006': [
    `Represent selection as a collection, add aria-multiselectable true, and expose aria-selected for each option. Choose an APG-supported multiple-selection keyboard model. In a modifier-free model, Space toggles the active option, with optional range and select-all behavior documented. Keep focus independent of selection so navigation does not unexpectedly clear choices. Define disabled behavior, output payloads, and reconciliation when options disappear. This is a new public contract, not just changing value to an array.`,
    `Rendering ten thousand options can cost layout and memory, but virtualization can remove the element referenced by aria-activedescendant. Keep the active option rendered or provide a compatible identity strategy, and expose position and set-size information where the virtualized pattern requires it. Coordinate scrolling and rendering before assigning the reference. Test navigation across window boundaries, typeahead to offscreen items, and screen reader behavior. Consider filtering or a native control before adding complexity that the task does not need.`,
    `A popup select needs a named trigger, expanded state, an appropriate popup relationship, opening and closing keys, selection commitment, Escape handling, and focus restoration. Define whether DOM focus moves to the listbox or remains on a combobox-like trigger with active descendant management; follow the selected pattern consistently. Use an overlay strategy for positioning and outside interaction. Keep the standalone listbox's selection logic reusable, but do not assume adding a button and hiding the list supplies the complete popup contract.`,
  ],
  'API-001': [
    `Flag outputs that collide with native DOM events such as click, input, change, focus, blur, keydown, and submit. A library lint rule can inspect output declarations and aliases against a maintained event-name set, with reviewed exceptions for intentional contracts. Prefer domain names such as selectionChange or dismissed when a new event is needed. Most native activation needs no wrapper output. Test bubbling and output behavior from the consumer host rather than only checking the declaration name.`,
    `A consumer can handle the native event when device details are truly needed. That does not by itself justify emitting another click event. Keyboard and assistive-technology activation do not always map cleanly to a simple mouse-versus-keyboard label, so avoid making business behavior depend on a guessed source. If a domain event needs additional context, define a distinct typed payload and document its semantics. Verify one activation still produces one action.`,
    `Introduce variant as the preferred input while preserving kind for a published deprecation period. Distinguish unset from an explicit primary value and resolve variant first, then kind, then the default. Warn only on actual old usage in development, provide editor hints and a template migration, and remove the old name in the announced major. Test both names together and direct component-reference uses because changing the input getter's default can be observable even when rendering is unchanged.`,
  ],
  'API-002': [
    `Let the form field and projected control communicate through a small injected contract. The field owns unique identifiers for helper and error text; the control directive merges them with any consumer-provided descriptions on the native element. Register and unregister as content changes, and keep invalid and label state synchronized. Do not overwrite the consumer's existing aria-describedby values. Test multiple fields and dynamic helper or error content through a host.`,
    `Wrapping is appropriate for a genuinely composite widget with coordinated elements, such as a date picker with a popup trigger or a control whose internal structure is intrinsic to its behavior. It can also enforce a carefully documented layout contract. The cost is forwarding native capabilities, focus, labels, and forms integration. If the wrapper mainly adds a border to one input, an attribute directive usually gives a smaller and more adaptable API. Choose according to the task and supported customization, not stylistic preference.`,
    `Host directives can compose reusable behavior statically and expose selected inputs and outputs explicitly. They can help share focus, disabled state, or other host-level logic across native controls. They do not automatically forward arbitrary attributes to an internal input and do not replace the form-field relationship contract. Check construction and input precedence when composing directives. Document the exposed API so consumers know which capabilities belong to the public control.`,
  ],
  'API-003': [
    `Choose data configuration for uniform repeated structures where a schema is useful, such as column identifiers, sorting rules, widths, and value accessors. Use templates or projection for rich content that varies structurally. A table can combine typed column metadata with cell templates. The decision depends on whether consumers need to describe data or compose UI. Keep the configuration type narrow and avoid callbacks for every possible piece of markup.`,
    `Use a real title link as the primary navigation action and separate action buttons. A stretched-link technique can enlarge the title link's hit area while carefully preserving interactive controls above it. Avoid nesting buttons or links inside another interactive element and avoid a container click handler that hijacks text selection or child actions. Show clear focus and hover states and test keyboard traversal. In some cards, keeping only the title clickable is the simplest accessible design.`,
    `Export named slot directives with clear selectors and JSDoc, include compile-checked examples, and describe which slots are optional or repeatable. Editors can discover directives and their inputs more reliably than an undocumented attribute convention. Document heading responsibility, image alternatives, empty slots, and layout behavior. Projection selectors alone do not create typed slot metadata or lazy instantiation. Use a template contract when the library needs context or deferred creation.`,
  ],
  'API-004': [
    `Forms registers a view-to-model callback that marks the control pending dirty for a user change, then commits dirty state according to the update policy. Calling that callback during writeValue falsely takes the user-change path during a programmatic write. With updateOn blur, the pending state may commit later, so timing differs. writeValue should update only the view. Test reset leaves the form pristine and verify genuine user interaction marks it dirty.`,
    `Put the value accessor on the group so it represents one selected value. Individual radio items report user selection to the group, while the group handles writeValue, onChange, touched behavior, and disabled propagation. Use native radio semantics or a complete radiogroup keyboard pattern, unique grouping names, and an accessible group label. Object values may need a comparison contract. Programmatic writes must not emit user changes, and moving focus within the group should follow the chosen touched policy.`,
    `Signal forms use their own custom-control interfaces rather than assuming ControlValueAccessor is the adapter. For a checkbox-like control, inspect the checked-control interface and field binding for the supported Angular version; value controls use the value-control interface. Expose the expected model and state signals, and test disabled, touched, validation, and labels through that integration. If supporting reactive forms too, document both adapters and avoid simultaneous competing writers to the same state.`,
  ],
  'VER-001': [
    `Publish the fix according to the compatibility policy and urgency. If a compatible security backport is feasible, release it on supported older majors with tests. If the fix truly requires a break, publish the new major with a focused migration and explain the risk and any temporary mitigation for teams that cannot upgrade immediately. Coordinate disclosure and support windows. Do not conceal a breaking change inside a supposedly compatible patch merely because the reason is security.`,
    `Choose the number of supported major lines from team capacity, consumer release cadence, and risk, then publish exact dates and coverage. Support might include security patches and critical regressions without new features. State supported Angular ranges and what happens after end of support. One current line and one previous line can be practical for some organizations, but it is not a universal answer. Make the commitment sustainable and measurable rather than promising every historical version indefinitely.`,
    `Under ordinary semantic versioning, a breaking change belongs in a major release. If the organization adopts an explicit exception policy, communicate it before consumers rely on minor compatibility, label the change prominently, and provide migration and risk guidance. Calling a break a bug fix does not make it compatible. Prefer a new major or a staged opt-in path. Any exception weakens the useful guarantee of minor upgrades, so explain the trade-off honestly.`,
  ],
  'VER-002': [
    `One alias gives one public binding name for an input; it does not generally expose two independently accepted names with a documented precedence. Renaming only the TypeScript property while aliasing kind keeps the old template API rather than introducing variant alongside it. Two inputs with an unset state support both names during migration and make conflict resolution explicit. Test the public binding metadata and consumer templates instead of assuming a property rename changes both names.`,
    `Use AST and symbol analysis for known component references and statically resolvable setInput string names. Inspect directive composition metadata for exposed or renamed bindings and update templates according to the actual public name. Dynamic expressions and generated code may need a diagnostic report rather than an automatic rewrite. Keep fixtures for aliases, both-name conflicts, unrelated kind properties, and repeat runs. A safe migration reports uncertainty instead of making a broad text replacement.`,
    `Collect static usage scans, migration completion, consumer build results, and confirmations from owners within the published support window. Include direct property reads and programmatic inputs, not only templates. Development warnings can guide teams, but should not silently transmit telemetry. Remove kind in the announced major when supported consumers have a workable path, with release notes and a final migration. Lack of warnings in the library's demo is not evidence that all product teams migrated.`,
  ],
  'VER-003': [
    `Declare only the framework versions actually supported and tested. Build a consumer matrix at the minimum and relevant releases within the range, including forms, secondary entry points, harnesses, and zoneless behavior where supported. A broad greater-than-or-equal range claims future compatibility you cannot validate. Use bounded compatible ranges when appropriate and revise them as releases are tested. Do not choose the range solely from the framework version installed in the library workspace.`,
    `Resolve named imports from the root entry point and map supported symbols to their feature entry points. Split mixed imports where needed, preserve type-only imports and aliases, and update tests and documentation. Report ambiguous wildcard or dynamic imports. Validate the result against the packed package, not monorepo path mappings. Keep a root compatibility re-export during a deprecation window when feasible, then remove it in the announced major.`,
    `The package manager may report a peer conflict or refuse installation depending on its version and policy. Forcing installation can produce a graph outside one library's supported range, leading to build or runtime failures. Align dependency versions, upgrade a library, or use supported alternatives rather than ignoring the conflict automatically. Inspect the resolved graph and test the resulting consumer. Peer metadata communicates a constraint; it does not prove runtime compatibility by itself.`,
  ],
  'TST-001': [
    `Expose task-level operations and observable state: select a tab by label, read the selected label, send a supported key, and inspect focus when that is meaningful. Hide private fields, raw nodes, styling classes, and internal component hierarchy. The harness can use internal selectors because the library owns their maintenance. Publish filters and useful errors, and version the harness API. If consumers still need to query private DOM after obtaining the harness, revisit the missing supported operation.`,
    `Verify a connected persistent live region receives the intended new text with the chosen politeness and timing, or verify the announcer boundary in a focused unit test. Then use real browser integration to ensure the region exists and updates. An automated DOM assertion cannot prove the exact speech emitted by a screen reader. Perform manual checks on supported combinations for repetition, interruption, and rapid changes, and record those limits in the test evidence.`,
    `Classify flakes before changing thresholds: fonts, animation, data, timing, viewport, and actual layout races need different fixes. Freeze irrelevant variability and wait for a deterministic ready condition. Map each screenshot to a risk, keep representative themes and states, and remove redundant captures only when coverage remains. Review baseline changes deliberately. Do not approve all two thousand images blindly or disable the suite; rebuild a smaller reliable signal with clear ownership.`,
  ],
  'PERF-001': [
    `Important notifications include a template-consumed signal changing, markForCheck, component setInput, bound template or host listeners, and async-pipe emissions. Attaching an already dirty view also participates. A raw promise, timeout, or plain field assignment is not a notification on its own. NgZone.run does not substitute for a zoneless notification, although it can remain relevant to zone-based consumers. Test async updates without manually forcing every render.`,
    `Adapt the callback to a signal consumed by the template, an observable exposed through the async pipe, or a controlled markForCheck path. Keep subscription cleanup and stale callback handling tied to destruction. Avoid copying the data into an unobserved field and hoping another event triggers a render. If callbacks are extremely frequent, batch according to the UI's needs and profile the result, while preserving the final state. Retain zone-boundary optimizations where they matter for zone-based consumers.`,
    `Search for zone lifecycle observables, plain fields written by promises or timers, subscriptions without teardown, and constructor DOM reads. Treat matches as review candidates. Run consumer hosts zoneless and exercise async completion, input updates, repeated interaction, and destruction. Add regression tests for missing notifications instead of forcing global change detection. Use profiling after correctness to find excessive work, and test supported framework ranges before claiming library-wide compatibility.`,
  ],
};

export const clarifications = {
  accessibility: [
    ['Repeated-letter typeahead', 'The reference buffer accumulates repeated letters, so typing the same letter twice quickly searches for a doubled prefix rather than cycling. The supplemental listbox example resets repeated single-letter input to a one-letter search and verifies cycling. The source remains unchanged.'],
    ['Browser checks and announcements', 'DOM and browser interaction checks establish names, relationships, and focus in the tested browser. They do not establish a universal screen-reader announcement or server-hydration identifier strategy.'],
  ],
  versioning: [
    ['Direct-reference compatibility', 'The deprecation correction changes kind() from primary to undefined when unset. Consumers reading that getter can observe the change even though the rendered default stays primary. Treat those reads as migration cases.'],
    ['Installation versus imports', 'Secondary entry points alone do not make date-fns optional to install. Optional peer metadata or a separate package must match the isolated feature and its declarations.'],
  ],
  performance: [
    ['Notifications are explicit', 'Zone-based rendering is not a guarantee for every asynchronous API. In the tested zoneless flow, state consumed by a template must notify Angular.'],
    ['Overlapping requests', 'The minimal source correction clears a timer but does not ignore stale promise completions or completions after destruction. The supplemental example adds a sequence guard and lifetime check.'],
  ],
};
